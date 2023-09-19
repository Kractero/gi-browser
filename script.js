let version = "7.1";
const parser = new DOMParser();
const abortController = new AbortController();

document.addEventListener("alpine:init", () => {
  Alpine.store("config", {
    mainNation: localStorage.getItem("gotIssuesUserAgent") || "",
    puppets: localStorage.getItem("gotIssuesNations")
      ? JSON.parse(localStorage.getItem("gotIssuesNations"))
      : "",
    password: localStorage.getItem("gotIssuesCred") || "",
    multiplePasswords: localStorage.getItem("gotIssuesmultiplePasswords")
      ? JSON.parse(localStorage.getItem("gotIssuesmultiplePasswords"))
      : false,
    getUserAgent() {
      return `${this.mainNation} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`;
    },
    writeToStorage() {
      localStorage.setItem("gotIssuesNations", JSON.stringify(this.puppets));
      localStorage.setItem("gotIssuesCred", this.password);
      localStorage.setItem("gotIssuesUserAgent", this.mainNation);
      localStorage.setItem(
        "gotIssuesmultiplePasswords",
        this.multiplePasswords
      );
    },
  });
});

let openNewLinkArr = [];
let generatedContent = "";
let containerise_nation = "";
let containerise_container = "";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const progressParagraph = document.getElementById("progress");
progressParagraph.style.display = "block";

function handleDownload(mode) {
  let blob;
  if (containerise_container && containerise_nation) {
    blob = new Blob([containerise_container], { type: "text/txt" });
    urlObject(blob, "Containerise (Container)");
    blob = new Blob([containerise_nation], { type: "text/txt" });
    urlObject(blob, "Containerise (Nation)");
  } else {
    blob = new Blob([generatedContent], { type: "text/html" });
    urlObject(blob, mode);
  }
}

function urlObject(blob, mode) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${mode}.${
    ["gotIssues", "Login Sheet", "junkDaJunk"].includes(mode) ? "html" : "txt"
  }`;
  link.click();
  window.URL.revokeObjectURL(url);
}

let counter = 0;
function openNextLink() {
  if (counter > openNewLinkArr.length - 1) {
    return;
  }
  document.getElementById("openNextButton").disabled = false;
  window.open(openNewLinkArr[counter], "_blank");
  counter++;
}

async function nsIterator(main, puppets, mode) {
  puppets = puppets.split("\n");
  let buildString = "";
  for (let i = 0; i < puppets.length; i++) {
    let nation = puppets[i];
    if (nation.includes(",")) {
      nation = nation.substring(0, nation.indexOf(","));
    }
    const nation_formatted = nation.toLowerCase().replaceAll(" ", "_");
    if (mode === "Container Rules") {
      containerise_nation += `@^.*\\.nationstates\\.net/(.*/)?nation=${nation_formatted}(/.*)?$ , ${nation}\n`;
      containerise_container += `@^.*\\.nationstates\\.net/(.*/)?container=${nation_formatted}(/.*)?$ , ${nation}\n`;
    }
    if (mode === "Login Sheet") {
      buildString += `<tr><td><p>${i + 1} of ${
        puppets.length
      }</p></td><td><p><a target="_blank" href="https://www.nationstates.net/nation=${nation_formatted}/page=upload_flag/test=1/User_agent=${main}">Link to Nation</a></p></td></tr>`;
    }
  }
  if (mode === "Login Sheet") generatedContent = htmlContent(buildString);
  const progress = document.createElement("p");
  progress.textContent = `Finished processing`;
  progressParagraph.prepend(progress);
  handleDownload(mode);
}

async function gotIssues(main, puppets, password, format) {
  let userAgent = `${main} Gotissues Written by 9003, Email NSWA9002@gmail.com,discord: 9003, NSNation 9003`;
  puppets = puppets.split("\n");
  let issuesCount = 0;
  let packsCount = 0;
  let issuesContent = ""
  let packContent = ""
  openNewLinkArr = []
  const interimPacks = []
  for (let i = 0; i < puppets.length; i++) {
    let nation = puppets[i];
    if (format) {
      nation = puppets[i].split(",")[0];
      password = puppets[i].split(",")[1];
    } else if (nation.includes(",")) {
      nation = nation.substring(0, nation.indexOf(","));
    }
    if (abortController.signal.aborted) {
      break;
    }
    const nation_formatted = nation.toLowerCase().replaceAll(" ", "_");
    const progress = document.createElement("p");
    try {
      await sleep(700);
      progress.textContent = `Processing ${nation} ${i + 1}/${puppets.length}`;
      progressParagraph.prepend(progress);
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
      const xml = await response.text();
      const xmlDocument = parser.parseFromString(xml, "text/xml");
      const issueIds = xmlDocument.querySelectorAll("ISSUE");
      const packs = xmlDocument.querySelector("PACKS");
      issueIds.forEach((issue) => {
        openNewLinkArr.push(`https://www.nationstates.net/container=${
          nation_formatted
        }/nation=${nation_formatted}/page=show_dilemma/dilemma=${
          issue.getAttribute('id')
        }/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/`)
        issuesContent += `<tr><td><p>${issuesCount+1}</p></td><td><p><a target="_blank" href="https://www.nationstates.net/container=${
        nation_formatted
      }/nation=${nation_formatted}/page=show_dilemma/dilemma=${
        issue.getAttribute('id')
      }/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/">Link to Issue</a></p></td></tr>`
        issuesCount++
      });
      if (packs) {
        for (let i = 0; i < parseInt(packs.textContent); i++) {
          interimPacks.push(`https://www.nationstates.net/page=deck/nation=${
            nation_formatted
          }/container=${
            nation_formatted
          }/?open_loot_box=1/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1`)
          packContent += `<tr><td><p>${packsCount+1}</p></td><td><p><a target="_blank" href="https://www.nationstates.net/page=deck/nation=${
            nation_formatted
          }/container=${
            nation_formatted
          }/?open_loot_box=1/template-overall=none//User_agent=${userAgent}/Script=Gotissues/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1">Link to Pack</a></p></td></tr>`
          packsCount++
        }
      }
    } catch (err) {
      progress.textContent = `Error processing ${nation} with ${err}`;
    }
  }
  openNewLinkArr = [...openNewLinkArr, ...interimPacks]
  issuesContent = issuesContent += packContent
  generatedContent = htmlContent(issuesContent);
  const progress = document.createElement("p");
  progress.textContent = `Finished processing`;
  progressParagraph.prepend(progress);
  handleDownload("gotIssues");
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
};

async function junkDaJunk(main, puppets) {
  let junkHtml = "";
  puppets = puppets.split("\n");
  openNewLinkArr = []
  for (let i = 0; i < puppets.length; i++) {
    let nation = puppets[i].toLowerCase().replaceAll(" ", "_");
    if (nation.includes(",")) {
      nation = nation.substring(0, nation.indexOf(","));
    }
    if (abortController.signal.aborted) {
      break;
    }
    const progress = document.createElement("p");
    try {
      await sleep(700);
      progress.textContent = `Processing ${nation} ${i + 1}/${puppets.length}`;
      progress.style.color = "blue";
      progressParagraph.prepend(progress);
      const response = await fetch(
        `https://www.nationstates.net/cgi-bin/api.cgi/?nationname=${nation}&q=cards+deck`,
        {
          headers: {
            "User-Agent": main,
          },
        }
      );
      const xml = await response.text();
      const xmlDocument = parser.parseFromString(xml, "text/xml");
      const cards = xmlDocument.querySelectorAll("CARD");
      for (let i = 0; i < cards.length; i++) {
        const id = cards[i].querySelector("CARDID").textContent;
        const season = cards[i].querySelector("SEASON").textContent;
        await sleep(700);
        const response = await fetch(
          `https://www.nationstates.net/cgi-bin/api.cgi/?cardid=${id}&season=${season}&q=card+markets+info`,
          {
            headers: {
              "User-Agent": main,
            },
          }
        );
        const xml = await response.text();
        const xmlDocument = parser.parseFromString(xml, "text/xml");
        const category = xmlDocument.querySelector("CATEGORY").textContent;
        const marketValue =
          xmlDocument.querySelector("MARKET_VALUE").textContent;
        const region = xmlDocument.querySelector("REGION");

        let highestBid = 0;
        const markets = xmlDocument.querySelectorAll("MARKET");

        markets.forEach((market) => {
          if (market.querySelector("TYPE").textContent === "bid") {
            const price = parseFloat(market.querySelector("PRICE").textContent);
            if (price > highestBid) {
              highestBid = price;
            }
          }
        });

        let junk = false;
        const categoryThresholds = {
          common: 0.5,
          uncommon: 1,
          rare: 1,
          "ultra-rare": 1,
          epic: 1,
        };

        if (
          categoryThresholds.hasOwnProperty(category) &&
          highestBid < categoryThresholds[category]
        ) {
          junk = true;
        }
        if (parseFloat(marketValue) >= 10) junk = false;

        // if (region) {
        //   region = region.textContent
        //   if (region === "Testregionia") {
        //     junk = false
        //   }
        // }

        if (junk) {
          const progress = document.createElement("p");
          progress.textContent = `${i + 1}/${
            cards.length
          } -> Junking S${season} ${id} with mv ${marketValue} and highest bid ${highestBid}, rarity ${category}`;
          progress.style.color = "red";
          progressParagraph.prepend(progress);
          openNewLinkArr.push(
            `https://www.nationstates.net/container=${nation}/nation=${nation}/page=ajax3/a=junkcard/card=${id}/season=${season}/User_agent=${main}Script=JunkDaJunk/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1`
          );
          junkHtml += `<tr><td><p>${i + 1} of ${
            cards.length
          }</p></td><td><p><a target="_blank" href="https://www.nationstates.net/container=${nation}/nation=${nation}/page=ajax3/a=junkcard/card=${id}/season=${season}/User_agent=${main}Script=JunkDaJunk/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1\n">Link to Card</a></p></td></tr>`;
        } else {
          const progress = document.createElement("p");
          progress.textContent = `${i + 1}/${
            cards.length
          } -> Gifting ${id} with mv ${marketValue} and highest bid ${highestBid}, rarity ${category}`;
          progress.style.color = "green";
          progressParagraph.prepend(progress);
          openNewLinkArr.push(
            `https://www.nationstates.net/page=deck/container=${nation}/nation=${nation}/card=${id}/season=${season}/gift=1/User_agent=${main}Script=JunkDaJunk/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1`
          );
          junkHtml += `<tr><td><p>${i + 1} of ${
            cards.length
          }</p></td><td><p><a target="_blank" href="https://www.nationstates.net/page=deck/container=${nation}/nation=${nation}/card=${id}/season=${season}/gift=1/User_agent=${main}Script=JunkDaJunk/Author_Email=NSWA9002@gmail.com/Author_discord=9003/Author_main_nation=9003/autoclose=1\n">Link to Card</a></p></td></tr>`;
        }
      }
    } catch (err) {
      progress.textContent = `Error processing ${nation} with ${err}`;
    }
  }
  generatedContent = htmlContent(junkHtml);
  const progress = document.createElement("p");
  progress.textContent = `Finished processing`;
  progressParagraph.prepend(progress);
  handleDownload("junkDaJunk");
}

window.addEventListener("beforeunload", () => {
  abortController.abort();
});
