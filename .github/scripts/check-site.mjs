import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, lstatSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const root = process.cwd();
const manifest = JSON.parse(readFileSync('PUBLICATION.json', 'utf8'));
assert.equal(manifest.distribution, 'bussola-da-honra-site');
const walk = dir => readdirSync(dir).flatMap(name => {
  if (name === '.git') return [];
  const path = `${dir}/${name}`;
  assert.ok(!lstatSync(path).isSymbolicLink(), 'Links simbólicos não são permitidos.');
  return lstatSync(path).isDirectory() ? walk(path) : [path.slice(root.length + 1)];
});
const names = walk(root);
assert.deepEqual(names.sort(), [...Object.keys(manifest.sha256), 'PUBLICATION.json'].sort());
for (const [name, hash] of Object.entries(manifest.sha256)) {
  assert.ok(!name.startsWith('/') && !name.split('/').includes('..'));
  assert.ok(!/(^|\/)(?:\.env|\.openai|originais-privados|artifacts|node_modules)(\/|$)/.test(name));
  const bytes = readFileSync(name);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, `Conteúdo alterado: ${name}`);
  assert.ok(!/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|Authorization:\s*Bearer\s+\S+/i.test(bytes.toString()), `Possível credencial: ${name}`);
}
for (const name of manifest.site_files) {
  assert.ok(manifest.sha256[name], `Arquivo fora do manifesto: ${name}`);
  assert.ok(!name.startsWith('.github/') && name !== 'PUBLICATION.json');
}
for (const page of ['index.html', 'agentes.html', 'mapa.html', 'aplicativo.html', 'privacidade.html']) {
  const html = readFileSync(page, 'utf8');
  assert.ok(html.includes('spartan.css'));
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:|#)/.test(url)) continue;
    assert.ok(!url.startsWith('/'), `Caminho incompatível com Pages: ${url}`);
    assert.ok(existsSync(resolve(dirname(page), url.split(/[?#]/)[0])), `Link ausente: ${url}`);
  }
}
console.log(`Distribuição pública íntegra: ${manifest.site_files.length} arquivos do site; páginas e caminhos relativos conferidos.`);
