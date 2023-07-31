# Mise au point des pages

## Interface

Pour créer un eCRF, il faut se connecter sur l'interface administrateur, afficher le panneau de configuration « Projets » [1] puis cliquer sur le menu « Accès » du projet d'intérêt [2]. Vous pouvez mettre le lien ouvert en favoris pour accéder directement au projet par la suite.

<div class="screenshot"><img src="/_static/help/dev_access.webp" alt=""/></div>

## Vue par défaut

Un nouvel onglet s'ouvre dans votre navigateur. Le bandeau noir en haut de page permet de configurer l'affichage de la page. Vous pouvez afficher (ou non) un ou deux panneaux en sélectionnant (ou désélectionnant) le(s) panneau(x) d'intérêt. Par défaut, le panneau « Liste » [2] est sélectionné. Les différents panneaux de configuration sont : « Code » [1], « Liste » [2] et « Saisie » [3]. Le menu déroulant central [4] vous permet de naviguer entre les différentes pages de votre eCRF (ici la première page se nomme « Introduction »). Le menu déroulant intermédiaire [5] vous permet de naviguer entre les différents sous-projets si votre projet a été subdivisé. Enfin le menu déroulant tout à droite [6] vous permet de changer votre mot de passe ou déconnecter votre session.

<div class="screenshot"><img src="/_static/help/dev_panels.webp" alt=""/></div>

### Code

Le panneau de configuration « Code » vous permet d'éditer votre eCRF. Il contient deux onglets : « Application » et « Formulaire ». Par défaut, l'onglet « Formulaire » est affiché.

L'onglet « Formulaire » vous permet l'édition du contenu de votre eCRF pour une page donnée (ici « Introduction ». Pour rappel la navigation entre les différentes pages de votre formulaire s'effectue via le menu déroulant [1]).
Le contenu est édité en ligne de codes via un éditeur de script. Le langage de programmation est le JavaScript. La connaissance du langage n'est pas nécessaire pour la création et l'édition de scripts simples. L'édition de l'eCRF et les différents modules de code seront abordés plus en détails ultérieurement.

<div class="screenshot"><img src="/_static/help/dev_code1.webp" alt=""/></div>

L'onglet « Application » vous permet d'éditer la structure générale de votre eCRF. Elle permet ainsi de définir les différentes pages et ensemble de pages. La structure est également éditée en ligne de code via un éditeur de script (également Javascript). L'édition de la structure de l'eCRF et les différents modules de code seront abordés plus en détail ultérieurement.

<div class="screenshot"><img src="/_static/help/dev_code2.webp" alt=""/></div>

### Liste

Le panneau « Liste » vous permet d'ajouter des nouvelles observations (« Ajouter un suivi ») et de monitorer le recueil de données. La variable « ID » correspond à l'identifiant d'un formulaire de recueil. Il s'agit d'un numéro séquentiel par défaut mais cela peut être paramétré. Les variables « Introduction », « Avancé » et « Mise en page » correspondent aux trois pages de l'eCRF d'exemple.

<div class="screenshot"><img src="/_static/help/dev_list.webp" alt=""/></div>

### Saisie

Le panneau de configuration « Saisie » vous permet de réaliser le recueil d'une nouvelle observation (nouveau patient) ou de modifier une observation donnée (après sélection de l'observation dans le panneau de configuration « Liste »). La navigation entre les différentes pages de l'eCRF peut s'effectuer avec le menu déroulant [1] ou le menu de navigation [2]. Après avoir réalisé la saisie d'une observation, cliquer sur « Enregistrer » [3].

<div class="screenshot"><img src="/_static/help/dev_entry.webp" alt=""/></div>

## Widgets standards

Les widgets sont créés en appelant des fonctions prédéfinies avec la syntaxe suivante :

<p class="code"><span style="color: #24579d;">function</span> ( <span style="color: #c09500;">"nom_variable"</span>, <span style="color: #842d3d;">"Libellé présenté à l'utilisateur"</span> )</p></p>

Les noms de variables doivent commencer par une lettre ou \_, suivie de zéro ou plusieurs caractères alphanumériques ou \_. Ils ne doivent pas contenir d'espaces, de caractères accentués ou tout autre caractère spécial.

La plupart des widgets acceptent des paramètres optionnels de cette manière :

<p class="code"><span style="color: #24579d;">function</span> ( <span style="color: #c09500;">"nom_variable"</span>, <span style="color: #842d3d;">"Libellé présenté à l'utilisateur"</span>, {
    <span style="color: #054e2d;">option1</span> : <span style="color: #431180;">valeur</span>,
    <span style="color: #054e2d;">option2</span> : <span style="color: #431180;">valeur</span>
} )</p>

Attention à la syntaxe du code. Lorsque les parenthèses ou les guillemets ne correspondent pas, une erreur se produit et la page affichée ne peut pas être mise à jour tant que l'erreur persiste. La section sur les erreurs contient plus d'informations à ce sujet.

### Saisie d'information

<div class="table-wrapper colwidths-auto docutils container">
    <table class="docutils align-default">
        <tr>
            <th>Widget</th>
            <th>Code</th>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 58px; object-position: 0px 0px;"/></td>
            <td class="code">form.text("variable", "Libellé")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 58px; object-position: 0 -53px;"/></td>
            <td class="code">form.number("variable", "Libellé")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 58px; object-position: 0 -106px;"/></td>
            <td class="code">form.slider("variable", "Libellé")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 58px; object-position: 0 -175px;"/></td>
            <td class="code">form.date("nom_variable", "Libellé")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 63px; object-position: 0 -228px;"/></td>
            <td class="code">form.binary("nom_variable", "Libellé")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 63px; object-position: 0 -285px;"/></td>
            <td class="code">form.enum("nom_variable", "Libellé", [
    ["modality1", "modality1 Label"],
    ["modality2", "modality2 Label"]
    ])</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 58px; object-position: 0 -340px;"/></td>
            <td class="code">form.enumDrop("nom_variable", "Libellé", [
    ["modality1", "modality1 Label"],
    ["modality2", "modality2 Label"]
    ])</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 74px; object-position: 0 -392px;"/></td>
            <td class="code">form.enumRadio("nom_variable", "Libellé", [
    ["modality1", "modality1 Label"],
    ["modality2", "modality2 Label"]
    ])</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 63px; object-position: 0 -461px;"/></td>
            <td class="code">form.multi("nom_variable", "Libellé", [
    ["modality1", "modality1 Label"],
    ["modality2", "modality2 Label"]
    ])</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 74px; object-position: 0 -517px;"/></td>
            <td class="code">form.multiCheck("nom_variable", "Libellé", [
    ["modality1", "modality1 Label"],
    ["modality2", "modality2 Label"]
    ])</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 51px; object-position: 0 -586px;"/></td>
            <td class="code">form.calc("nom_variable", 18)</td>
        </tr>
    </table>
</div>

### Autres widgets

<div class="table-wrapper colwidths-auto docutils container">
    <table class="docutils align-default">
        <tr>
            <th>Widget</th>
            <th>Code</th>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 152px; object-position: 0 -632px;"/></td>
            <td class="code">form.section("Nom de la section", () => {
    form.text("variable1", "Label 1")
    form.number("variable2", "Label 2")
    })</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 27px; object-position: 0 -779px;"/></td>
            <td class="code">form.output("This is &lt;b&gt;text&lt;/b&gt; content")</td>
        </tr>
        <tr>
            <td class="widget"><img src="/_static/help/widgets.png" style="height: 27px; object-position: 0 -801px;"/></td>
            <td class="code">form.output(html`This is &lt;b&gt;HTML&lt;/b&gt; content`)</td>
        </tr>
    </table>
</div>

<style>
    .widget {
        width: 100px;
        padding: 0.1em;
        background: #efefef;
    }
    .widget > img {
        width: 237px;
        object-fit: cover;
    }
    .code {
        font-family: monospace;
        white-space: pre-wrap;
        font-size: 1.1em;
        margin-left: 2em;
        color: #444;
    }
</style>