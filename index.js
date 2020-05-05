const github = require("@actions/github");
const core = require("@actions/core");

async function addLabel() {
  const hub = new github.GitHub(core.getInput("repo-token"));
  const ignoreLabeled = core.getInput("ignore-labeled");
  const labels = core.getInput("labels").split(",").map(s => s.trim());
  const repo = github.context.payload.repository.name;
  const owner = github.context.payload.repository.owner.login;
  const issueNumber = github.context.payload.issue.number;

  var issueInfo = await hub.issues.get({
    owner: owner,
    repo: repo,
    issue_number: issueNumber
  });

  let existingLabels = issueInfo.data.labels.map(l => l.name);
  if (ignoreLabeled !== null) {
    let pattern = new RegExp(ignoreLabeled, "i");
    for (let existingLabel of existingLabels) {
      if (existingLabel.match(pattern)) {
        return `Skipping issue ${issueNumber} because it contains a label ${existingLabel} which matches ${ignoreLabeled}`;
      }
    }
  }

  for (let label of labels) {
    if (!existingLabels.includes(label)) {
      existingLabels.push(label);
    }
  }

  await hub.issues.update({
    owner: owner,
    repo: repo,
    issue_number: issueNumber,
    labels: existingLabels
  });

  return `Added ${labels} to issue ${issueNumber}`;
}

addLabel()
  .then(
    result => {
      console.log(result);
      process.exit(0);
    },
    err => core.setFailed(err)
  );
