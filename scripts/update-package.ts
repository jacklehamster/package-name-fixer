import { execSync } from 'child_process';

export default async function fixPackage(
  path: string = ".",
  packageJson?: string,
  execute: ((command: string) => Buffer) = execSync,
  myFetch: (url: string) => Promise<Partial<Response>> = fetch) {
  let file;
  if (!packageJson) {
    file = Bun.file(`${path}/package.json`);
    packageJson = await file.text();
  }
  const repoName = getRepoName();
  const repoAuthor = getAuthorName();
  const repoEmail = getAuthorEmail();
  const repoUrl = getRepoUrl();
  const repoDetails = await getRepoDetails(getRepoOwner(repoUrl), repoName);

  const pkg = JSON.parse(packageJson);
  if (pkg.name !== repoName || !pkg.version) {
    pkg.name = repoName;
    pkg.version = "1.0.0";
  }
  if (!pkg.engines) {
    pkg.engines = {
      node: ">=14.0.0",
    };
  }
  pkg.repository = {
    type: "git",
    url: repoUrl,
  }
  pkg.author = {
    name: repoAuthor,
    email: repoEmail,
  };
  pkg.description = repoDetails?.description ?? "<fill in description>";
  pkg.homepage = repoDetails?.homepage ?? "<fill in homepage>";

  if (!file) {
    return pkg;
  } else {
    const result = JSON.stringify(pkg, null, "  ") + "\n";
    if (result !== packageJson) {
      await Bun.write(file, result);
      console.info("Package updated.");
    } else {
      console.info("Package not updated. No change needed.");
    }
  }

  function getRepoName() {
    try {
      // Get the remote URL of the origin repository
      const remoteUrl = execute('git remote get-url origin').toString().trim();

      // Extract the repository name from the remote URL
      const repoName = remoteUrl.match(/\/([^\/]+?)(?:\.git)?$/)?.[1] || 'unknown';

      return repoName;
    } catch (error: any) {
      throw new Error("Unable to get repo name: " + error.message);
    }
  }

  function getAuthorEmail() {
    try {
      // Get the email of the author of the initial commit
      const authorEmail = execute('git log --format=%ae --reverse | head -n 1').toString().trim();
      return authorEmail;
    } catch (error: any) {
      throw new Error('Error retrieving repository author:' + error.message);
    }
  }

  function getAuthorName() {
    try {
      // Get the name and email of the author of the initial commit
      const authorName = execute('git log --format="%an" --reverse | head -n 1').toString().trim();
      return authorName;
    } catch (error: any) {
      throw new Error('Error retrieving repository author:' + error.message);
    }
  }

  function getRepoOwner(repoUrl: string): string {
    const match = repoUrl.match(/[:/]([^/]+)\/([^/]+)(\.git)?$/);
    return match?.[1] ?? "";
  }

  function getRepoUrl() {
    try {
      // Get the HTTPS URL of the origin repository
      const repoUrl = execute('git remote get-url origin').toString().trim();
      return repoUrl;
    } catch (error: any) {
      throw new Error('Error retrieving repository URL:' + error.message);
    }
  }

  async function getRepoDetails(owner: string, repo: string) {
    try {
      const response = await myFetch(`https://api.github.com/repos/${owner}/${repo}`);
      const data: any = await response.json?.();

      if (response.ok) {
        return {
          description: data.description || null,
          owner: data.owner ? { id: data.owner.id } : null,
          homepage: data.homepage || null,
        };
      } else {
        console.error(`Failed to fetch repository details for ${owner}/${repo}`, `${data.message}`);
        return null;
      }
    } catch (error: any) {
      console.error(`Error fetching repository details for ${owner}/${repo}:`, error.message);
      return null;
    }
  }
}
