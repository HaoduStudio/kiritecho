const { spawn } = require('child_process')
const electron = require('electron')

const args = process.argv.slice(2)

spawn(electron, args, {
  stdio: 'inherit',
  shell: true,
  windowsHide: false
})
