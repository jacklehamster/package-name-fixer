import fixPackage from "./scripts/update-package";

const [_bun, _script, arg] = process.argv;
fixPackage(arg === "test");
