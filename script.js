let version = "7.1"
const parser = new DOMParser();
const abortController = new AbortController();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const progressParagraph = document.getElementById('progress');
progressParagraph.style.display = 'block';
const issueIdsList = []

let mainName = document.getElementById("mainName").value;
let password = document.getElementById("password").value;
let puppetList = document.getElementById("puppetList").value;

let userAgent = `${mainName} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`
if (localStorage.getItem('gotIssuesUserAgent')) {
  document.getElementById("mainName").value = localStorage.getItem('gotIssuesUserAgent')
}
if (localStorage.getItem('gotIssuesNations')) {
  document.getElementById("puppetList").value = JSON.parse(localStorage.getItem('gotIssuesNations'))
}
if (localStorage.getItem('gotIssuesCred')) {
  document.getElementById("password").value = localStorage.getItem('gotIssuesCred')
}

document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();
  let containers = document.getElementById("containers").checked;
  let issues = document.getElementById("issues").checked;
  let login = document.getElementById("logins").checked;
  mainName = document.getElementById("mainName").value;
  userAgent = `${mainName} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`
  password = document.getElementById("password").value;
  puppetList = document.getElementById("puppetList").value;
  containers = document.getElementById("containers").checked;
  let format = true
  if (!password) {
    format = false
  }

  const puppets = puppetList.split('\n');
  let gotIssuesContent = ""
  if (issues) {
    document.getElementById('openNextButton').disabled = false;
    gotIssuesContent = await gotIssues(puppets, format)
  }

  let containerise_nation = ''
  let containerise_container = ''
  if (containers) {
    for (let i = 0; i < puppets.length; i++) {
      const nation = puppets[i]
      const nation_formatted = nation.toLowerCase().replaceAll(' ', '_')
      containerise_nation += `@^.*\\.nationstates\\.net/(.*/)?nation=${nation_formatted}(/.*)?$ , ${nation}\n`
      containerise_container += `@^.*\\.nationstates\\.net/(.*/)?container=${nation_formatted}(/.*)?$ , ${nation}\n`
    }
  }

  let loginContent = ''
  if (login) {
    for (let i = 0; i < puppets.length; i++) {
      const nation = puppets[i]
      const nation_formatted = nation.toLowerCase().replaceAll(' ', '_')
      loginContent += `<tr><td><p>${i + 1} of ${puppets.length}</p></td><td><p><a target="_blank" href="https://www.nationstates.net/nation=${nation_formatted}/page=upload_flag/test=1/User_agent=${userAgent}">Link to Nation</a></p></td></tr>`
    }
    loginContent = htmlContent(loginContent)
  }

  document.getElementById('download').addEventListener('click', () => {
    if (gotIssuesContent) {
      const htmlBlob = new Blob([gotIssuesContent], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(htmlBlob);
      a.download = "9003samazinglistofcards.html";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    if (loginContent) {
      const htmlBlob = new Blob([loginContent], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(htmlBlob);
      a.download = "logins.html";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
  })

  const progress = document.createElement("p")
  progress.textContent = `Finished processing`
  progressParagraph.prepend(progress)
});

let currentNation = 0
function openNextLink() {
  if (currentNation > issueIdsList.length - 1) {
    return
  }
  const puppet = issueIdsList[currentNation]
  if (puppet.issues.length > 0) {
    document.getElementById('openNextButton').disabled = false;
    const issueUrl = `https://www.nationstates.net/container=${puppet.nation}/nation=${puppet.nation}/page=show_dilemma/dilemma=${puppet.issues[0]}/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/`;
    window.open(issueUrl, '_blank');
    puppet.issues.shift()
  } else {
    currentNation++
    openNextLink()
  }
}

document.getElementById('openNextButton').addEventListener('click', openNextLink);

window.addEventListener('beforeunload', (e) => {
  abortController.abort();
});

document.getElementById('save').addEventListener('click', () => {
  localStorage.setItem('gotIssuesNations', JSON.stringify(document.getElementById("puppetList").value))
  localStorage.setItem('gotIssuesCred', document.getElementById("password").value)
  localStorage.setItem('gotIssuesUserAgent', document.getElementById("mainName").value)
})
document.getElementById('clear').addEventListener('click', () => localStorage.clear())

async function gotIssues(puppets, format) {
  for (let i = 0; i < puppets.length; i++) {
    let nation = puppets[i]
    if (!format) {
      nation = puppets[i].split(',')[0]
      password = puppets[i].split(',')[1]
    }
    if (abortController.signal.aborted) {
      break;
    }
    const nation_formatted = nation.toLowerCase().replaceAll(' ', '_')
    const progress = document.createElement("p")
    try {
      await sleep(700);
      progress.textContent = `Processing ${nation} ${i + 1}/${puppets.length}`
      progressParagraph.prepend(progress)
      const response = await fetch(
        "https://www.nationstates.net/cgi-bin/api.cgi/?nation=" +
        nation +
        "&q=issues+packs",
        {
          method: "GET",
          headers: {
            "User-Agent": userAgent,
            "X-Password": password.replace(" ", "_"),
          },
        }
      );
      const xml = await response.text()
      const xmlDocument = parser.parseFromString(xml, 'text/xml');
      const issueIds = xmlDocument.querySelectorAll('ISSUE');
      const packs = xmlDocument.querySelector('PACKS');
      const nationObj = {
        nation: nation_formatted,
        issues: [],
        packs: packs ? parseInt(packs.textContent) : 0
      }
      issueIds.forEach(issue => {
        nationObj.issues.push(issue.getAttribute('id'))
      });
      issueIdsList.push(nationObj)
    } catch (err) {
      progress.textContent = `Error processing ${nation} with ${err}`
    }
  }
  const totalcount = issueIdsList.reduce((count, puppet) => count + puppet.issues.length, 0);
  const packcount = issueIdsList.reduce((count, puppet) => count + puppet.packs, 0);
  let issueCount = 0;
  let packCount = 0;
  let issueContent = ''
  let packContent = ''
  for (let i = 0; i < issueIdsList.length; i++) {
    const puppet = issueIdsList[i];
    for (let j = 0; j < puppet.issues.length; j++) {
      issueContent += `<tr><td><p>${issueCount + 1} of ${totalcount}</p></td><td><p><a target="_blank" href="https://www.nationstates.net/container=${puppet.nation}/nation=${puppet.nation}/page=show_dilemma/dilemma=${puppet.issues[j]}/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/">Link to Issue</a></p></td></tr>`;
      issueCount++;
    }
    for (let j = 0; j < puppet.packs; j++) {
      packContent += `<tr><td><p>${packCount + 1} of ${packcount}</p></td><td><p><a target="_blank" href="https://www.nationstates.net/page=deck/nation=${puppet.nation}/container=${puppet.nation}/?open_loot_box=1/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1">Link to Pack</a></p></td></tr>`;
      packCount++;
    }
  };
  issueContent += packContent
  return htmlContent(issueContent)
}

const htmlContent = (content) => {
  return `
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
  ${content}
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
}
