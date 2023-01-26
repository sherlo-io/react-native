import { Build } from "@sherlo/api-client";
import git from "git-rev-sync";

const getGitInfo = (): Build["gitInfo"] => ({
  commitName: git.message(),
  commitHash: (Math.random() + 1).toString(36).substring(7), //git.short(),
  branchName: git.branch(),
});

export default getGitInfo;
