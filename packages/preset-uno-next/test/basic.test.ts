import { createGenerator, presetUno } from 'unocss'
import { expect, it } from 'vitest'
import { presetUnoNext } from '../src/index'
import { presetMiniTargets } from './assets/preset-mini-targets'

it('presetStarter', async () => {
  const unoNext = await createGenerator({
    presets: [presetUnoNext()],
  })

  const uno = await createGenerator({
    presets: [presetUno()],
  })

  const needFixed = []

  let sameString = `## Same Tokens

| Token | Same | UnoNext | Uno |
| --- | --- | --- | --- |
  `

  let differentString = `
## Different Tokens

| Token | Same | UnoNext | Uno |
| --- | --- | --- | --- |
`

  let result = `# Overview

`

  for (const target of presetMiniTargets) {
    const [cssnext, css] = await Promise.all([
      unoNext.generate(target, { preflights: false }).then(r => r.css.replace('/* layer: default */', '').trim()),
      uno.generate(target, { preflights: false }).then(r => r.css.replace('/* layer: default */', '').trim()),
    ])

    if (css && !cssnext) {
      needFixed.push(target)
    }

    const escape = (code: string) => `<code>${code.replace(/\|/g, '\\|').replace(/\n/g, '<br>')}</code>`

    const same = cssnext === css

    if (same) {
      sameString += `| \`${target}\` | ✅ | ${cssnext ? `${escape(cssnext)}` : '❓'} | ${css ? `${escape(css)}` : '❓'} |\n`
    }
    else {
      differentString += `| \`${target}\` | ❌ | ${cssnext ? `${escape(cssnext)}` : '❓'} | ${css ? `${escape(css)}` : '❓'} |\n`
    }
  }

  result += sameString + differentString

  expect(result).toMatchFileSnapshot('./fixtures/token-different.test.md')
  expect(needFixed).toMatchSnapshot()
})

it('test case', async () => {
  const unoNext = await createGenerator({
    presets: [presetUnoNext()],
  })

  const { css } = await unoNext.generate('pl-10px text-shadow-lg text-shadow-color-red', { preflights: false })

  expect(css).toMatchInlineSnapshot(`
    "/* layer: default */
    .text-shadow-lg{--un-text-shadow:3px 3px 6px var(--un-text-shadow-color, rgb(0 0 0 / 0.26)),0 0 5px var(--un-text-shadow-color, rgb(15 3 86 / 0.22));text-shadow:var(--un-text-shadow);}
    .text-shadow-color-red{--un-text-shadow-opacity:100%;--un-text-shadow-color:color-mix(in oklch, var(--color-red-400) var(--un-text-shadow-opacity), transparent);}
    .pl-10px{padding-left:10px;}"
  `)
})
