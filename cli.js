#!/usr/bin/env node

import * as git from 'isomorphic-git'
import * as http from 'isomorphic-git/http/node/index.js'
import * as fs from 'fs/promises'
import { fileURLToPath } from 'url'
import { promisify } from 'util'
import { exec as exec1 } from 'child_process'
const exec = promisify(exec1)

const dirname = fileURLToPath(new URL('.', import.meta.url))

async function withPackageJsonAndPath(path, callback) {
  const packageJson = await callback(JSON.parse(await fs.readFile(path)))
  await fs.writeFile(path, JSON.stringify(packageJson, null, 2))
}

/**
 * @param {String} source
 */
function extractNameFromSource(source) {
  return source.split('/').at(-1)
}

/**
 * @param {String} source
 */
function extractScopeFromSource(source) {
  const parts = source.split('/')
  return parts.length > 1 ? parts.at(0) : '<none>'
}

/**
 * @param {String} path
 */
async function findNextFreeName(path) {
  const files = await fs.readdir('.')
  const conflicts = files.filter(file => file.startsWith(path))

  if (conflicts.includes(path)) {
    let index = 1
    while (conflicts.includes(`${path}${index}`)) index++

    return `${path}${index}`
  } else {
    return path
  }
}

/**
 * @param {String} s
 * @param {String} suffix
 **/
function cutSuffix(s, suffix) {
  return s.endsWith(suffix) ? s.substring(0, s.length - suffix.length) : s
}

const packageJson = JSON.parse(await fs.readFile(`${dirname}./package.json`))
console.log(packageJson.name, 'version', packageJson.version, 'by', packageJson.author, '\n')

const repo    = process.argv[2]
const source  = repo
const scope   = extractScopeFromSource(source)
const name    = await findNextFreeName(cutSuffix(process.argv[3] || extractNameFromSource(source), '-template'))
const dir     = name
const pkg     = (scope ? ('@' + scope + '/') : '') + name;
const pkgfile = `./${name}/package.json`
const ghroot  = `https://github.com/${scope}/${name}`

const url = `https://github.com/${source}`
try {
  console.log('cloning', url, '...')
  await git.clone({ fs, http, dir, url })
} catch {
  console.log('cloning', url + '-template', '...')
  await git.clone({ fs, http, dir, url: url + '-template' })
}

console.log('cleaning up', dir, '...')
await fs.rm(`${dir}/.git`, { recursive: true })

console.log('configuring', dir, '...')
await withPackageJsonAndPath(pkgfile, async (packageJson) => {
  packageJson.version = '0.0.1'
  packageJson.name = pkg
  const { stdout: author } = await exec('npm config get init-author-name')
  const { stdout: email }  = await exec('npm config get init-author-email')
  packageJson.author = `${author.trim()}${email ? ` ${email.trim()}` : ''}`
  packageJson.homepage = `${ghroot}#readme`
  packageJson.bugs = {
    url: `${ghroot}/issues`
  }
  packageJson.repository = {
    type: 'git',
    url: `${ghroot}.git`
  }

  return packageJson
})

console.log('done.')
