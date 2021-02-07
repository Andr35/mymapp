// cargo-toml-updater.js

const version_regex = /^(version\s?=\s?\")(.*)(\")$/gm;

module.exports.readVersion = function (contents) {
  const match = version_regex.exec(contents);
  return match[2];
}

module.exports.writeVersion = function (contents, version) {
  return contents.replace(version_regex, '$1' + version + '$3');
}
