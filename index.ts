import fixPackage from "./scripts/update-package";
const [_bun, _script, path] = process.argv;

fixPackage(path);
