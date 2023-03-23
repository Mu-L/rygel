const crypto = require('crypto');
const fetch = require('node-fetch');
const xlsx = require('node-xlsx');
const sqlite3 = require('better-sqlite3');
const database = require('../lib/database.js');
const { util } = require('../lib/util.js');
const parse = require('../lib/parse.js');
const imp = require('../lib/import.js');

const DEMHETER_XLSX_URL = process.env.DEMHETER_XLSX_URL || '';
const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN || '';

const LIST_KEYS = ["Identites", "Mails"];

main();

async function main() {
    try {
        await run();
        console.log('Success!');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function run() {
    // Check prerequisites
    {
        let errors = [];

        if (!DEMHETER_XLSX_URL)
            errors.push('Missing DEMHETER_XLSX_URL (public link to download XLSX file)');
        if (!MAPBOX_ACCESS_TOKEN)
            errors.push('Missing MAPBOX_ACCESS_TOKEN');

        if (errors.length)
            throw new Error(errors.join('\n'));
    }

    let db = database.open();

    // Create map and layers if needed
    db.transaction(() => {
        let map_id = db.prepare(`INSERT INTO maps (name, title, mail)
                                     VALUES ('demheter', 'DEMHETER', 'demheter@chu-lille.fr')
                                     ON CONFLICT DO UPDATE SET title = excluded.title,
                                                               mail = excluded.mail
                                     RETURNING id`).pluck().get();

        let stmt = db.prepare(`INSERT INTO layers (map_id, name, title, fields) VALUES (?, ?, ?, ?)
                                   ON CONFLICT DO UPDATE SET title = excluded.title,
                                                             fields = excluded.fields`);

        stmt.run(map_id, 'centres', 'Centres', '{}');
        stmt.run(map_id, 'psychologues', 'Psychologues', '{}');
    })();

    // Load online spreadsheet file
    let wb;
    {
        let response = await fetch(DEMHETER_XLSX_URL);

        if (!response.ok) {
            let text = (await response.text()).trim();
            throw new Error(text);
        }

        let blob = await response.blob();
        let buffer = Buffer.from(await blob.arrayBuffer());

        wb = xlsx.parse(buffer);
    }

    // Transform rows to objects
    let tables = {};
    for (let ws of wb) {
        let keys = ws.data[0].map(key => key.trim());

        let table = [];

        for (let i = 1; i < ws.data.length; i++) {
            let row = {};

            for (let j = 0; j < keys.length; j++) {
                let value = ws.data[i][j];

                if (value == null) {
                    row[keys[j]] = null;
                } else if (typeof value === 'string') {
                    value = value.trim();

                    if (LIST_KEYS.includes(keys[j])) {
                        value = value.split('\n');
                        value = value.map(it => it.trim()).filter(it => it);
                    } else if (!value) {
                        value = null;
                    }

                    row[keys[j]] = value;
                } else {
                    row[keys[j]] = value;
                }
            }

            if (row.ID == null || row.Structure == null || row.Adresse == null)
                break;

            table.push(row);
        }

        tables[ws.name] = table;
    }

    let centres = tables['Centres'].map(transformCenter);
    let psychologues = tables['Psychologues'].map(transformPsychologist);

    db.transaction(() => {
        imp.updateEntries(db, 'demheter', 'centres', centres);
        imp.updateEntries(db, 'demheter', 'psychologues', psychologues);
    })();

    await imp.geomapMissing(db, 'demheter', MAPBOX_ACCESS_TOKEN);

    db.close();
}

function transformCenter(row) {
    let entry = {
        import: '' + row.ID,
        version: null,

        name: row.Structure,
        address: row.Adresse,

        demheter: String(row.DEMHETER).trim() == "1",
        ect: String(row.ECT).trim() == "1",

        mail: parse.cleanMail(row.Mail),
        telephone: parse.cleanPhoneNumber(row.Telephone),
        referents: row.Referents.split('\n').map(it => it.trim()).filter(it => it)
    };

    entry.version = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');

    return entry;
}

function transformPsychologist(row) {
    let entry = {
        import: '' + row.ID,
        version: null,

        name: row.Structure,
        address: row.Adresse,

        individus: (row.Identites || []).map((identite, i) => ({
            identite: identite,
            mail: parse.cleanMail(row.Mails[i])
        })),
        telephone: parse.cleanPhoneNumber(row.Telephone),
        orientation: row.Orientation
    };

    entry.version = crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex');

    return entry;
}