let version = "7.1"
const parser = new DOMParser();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const progressParagraph = document.getElementById('progress');
progressParagraph.style.display = 'block';

document.querySelector("form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const mainName = document.getElementById("mainName").value;
    const puppetList = document.getElementById("puppetList").value;
    const containers = document.getElementById("containers").checked;
    const puppets = puppetList.split('\n');
    const userAgent = `${mainName} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`
    const issueIdsList = []
    let containerise_nation = ''
    let containerise_container = ''
    for (let i = 0; i < puppets.length; i++) {
        await sleep(700);
        if (!puppets[i].includes(',')) throw new Error("FORMAT IT RIGHT PLEASE!")
        const nation = puppets[i].split(',')
        const progress = document.createElement("p")
        progress.textContent = `Processing ${nation[0]}, ${i+1}/${puppets.length}`
        if (containers) {
          containerise_nation += `@^.*\\.nationstates\\.net/(.*/)?nation=${nation[0].toLowerCase().replaceAll(' ', '_')}(/.*)?$ , ${nation[0]}\n`
          containerise_container += `@^.*\\.nationstates\\.net/(.*/)?container=${nation[0].toLowerCase().replaceAll(' ', '_')}(/.*)?$ , ${nation[0]}\n`
        }
        progressParagraph.prepend(progress)
        const response = await fetch(
            "https://www.nationstates.net/cgi-bin/api.cgi/?nation=" +
            nation[0] +
            "&q=issues+packs",
            {
                method: "GET",
                headers: {
                    "User-Agent": userAgent,
                    "X-Password": nation[1].replace(" ", "_"),
                },
            }
        );
        const xml = await response.text()
        const xmlDocument = parser.parseFromString(xml, 'text/xml');
        const issueIds = xmlDocument.querySelectorAll('ISSUE');
        const packs = xmlDocument.querySelector('PACKS');
        const nationObj = {
            nation: nation[0].toLowerCase().replaceAll(' ', '_'),
            issues: [],
            packs: packs ? parseInt(packs.textContent) : 0
        }
        issueIds.forEach(issue => {
            nationObj.issues.push(issue.getAttribute('id'))
        });
        issueIdsList.push(nationObj)
    }
    const totalcount = issueIdsList.reduce((count, puppet) => count + puppet.issues.length, 0);
    const packcount = issueIdsList.reduce((count, puppet) => count + puppet.packs, 0);
    let htmlContent = `
    <html>
    <head>
    <style>
    td.createcol p {
      padding-left: 10em;
    }
    
    a {
      text-decoration: none;
      color: black;
    }
    
    a:visited {
      color: grey;
    }
    
    table {
      border-collapse: collapse;
      display: table-cell;
      max-width: 100%;
      border: 1px solid darkorange;
    }
    
    tr, td {
      border-bottom: 1px solid darkorange;
    }
    
    td p {
      padding: 0.5em;
    }
    
    tr:hover {
      background-color: lightgrey;
    }
    </style>
    </head>
    <body>
    <table>
    `;
    
    let issueCount = 0;
    let packCount = 0;
    
    for (let i = 0; i < issueIdsList.length; i++) {
        const puppet = issueIdsList[i];
    
        for (let j = 0; j < puppet.issues.length; j++) {
            htmlContent += `
            <tr>
              <td><p>${issueCount + 1} of ${totalcount}</p></td>
              <td>
                <p>
                    <a target="_blank" href="https://www.nationstates.net/container=${puppet.nation}/nation=${puppet.nation}/page=show_dilemma/dilemma=${puppet.issues[j]}/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/">
                    Link to Issue
                    </a>
                </p>
              </td>
            </tr>`;
            issueCount++;
        }
        for (let j = 0; j < puppet.packs; j++) {
            htmlContent += `
            <tr>
              <td><p>${packCount + 1} of ${packcount}</p></td>
              <td>
                <p>
                <a target="_blank" href="https://www.nationstates.net/page=deck/nation=${puppet.nation}/container=${puppet.nation}/?open_loot_box=1/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1">
                  Link to Pack
                </a>
                </p>
              </td>
            </tr>`;
            packCount++;
        }
    }
    
    htmlContent += `
    <tr>
      <td>
        <p>
          <a target="_blank" href="https://this-page-intentionally-left-blank.org/">Done!</a>
        </p>
      </td>
      <td>
        <p>
          <a target="_blank" href="https://this-page-intentionally-left-blank.org/">Done!</a>
        </p>
      </td>
    </tr>
    </table>
    <script>
    document.querySelectorAll("td").forEach(function(el) {
      el.addEventListener("click", function() {
        const row = el.parentNode;
        row.nextElementSibling.querySelector("a").focus();
        row.parentNode.removeChild(row);
      });
    });
    </script>
    </body>
    </html>
    `;
    const htmlBlob = new Blob([htmlContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(htmlBlob);
    a.download = "9003samazinglistofcards.html";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (containers) {
      const blob = new Blob([containerise_container], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Containerise (container).txt";
      link.click();

      const blob2 = new Blob([containerise_nation], { type: 'text/plain' });
      const url2 = window.URL.createObjectURL(blob2);
      const link2 = document.createElement('a');
      link2.href = url2;
      link2.download = "Containerise (nation).txt";
      link2.click();

      window.URL.revokeObjectURL(url);
      window.URL.revokeObjectURL(url2);
    }

    const progress = document.createElement("p")
    progress.textContent = `Finished processing`
    progressParagraph.prepend(progress)
});
