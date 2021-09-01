const fs = require('fs')

if (process.argv < 3) {
	console.error('Missing argument')
	process.exit(1)
}

const infile_name = process.argv[2]
let contents = fs.readFileSync(infile_name)
contents = contents.toString().trim()

let counter = 1
let hour = '00'
let minute = '00'

let output = ''
let block = ''
let lines = ''
let escaped_newline = false

for (let line of contents.split('\n')) {
	line = line.trim()
	if (line.startsWith('#')) continue

	if (line.startsWith('MINUTE')) {
		minute = paddl2(line.slice(6).trim())
		continue
	}

	if (line.startsWith('HOUR')) {
		minute = paddl2(line.slice(4).trim())
		continue
	}

	if (line.startsWith('COUNTER')) {
		counter = Math.floor(Math.abs(Number(line.slice(7).trim())))
		if (isNaN(counter)) throw 'Argument of COUNTER must be a number!'
		continue
	}

	let first_char = line.charCodeAt(0)
	if (first_char >= '0'.charCodeAt(0) && first_char <= '9'.charCodeAt(0)) {
		/// new block
		let delim = line.indexOf(';')
		let start = srtnum(line.slice(0, delim))
		let end = srtnum(line.slice(delim + 1))

		if (output !== '') output += '\n\n'
		if (block !== '') output += block + lines
		block = `${counter++}\n${start} --> ${end}`
		lines = ''
		escaped_newline = false

		continue
	}

	if (line === '') {
		continue
	}

	let person = line[0]
	line = line.slice(1).trim()
	if (!escaped_newline) lines += '\n'
	else lines += '  '

	if (line.endsWith('\\')) {
		line = line.slice(0, -1)
		escaped_newline = true
	} else escaped_newline = false

	lines += `${person_marking(person) + line + '</b></font>'}`
}

if (lines !== '') block += lines
if (block !== '') output += '\n\n' + block

output = output.replaceAll('...', '…')

process.stdout.write("\ufeff" + output)

/// FUNCTIONS

/// @formatter:off
function srtnum(string) {
	const colons = string.match(/:/g)?.length ?? 0
	switch (colons) {
		default: throw 'Too many colons in \'' + string + '\'!'
		case 0:
			string = hour + ':' + minute + ':' + string
			break
		case 1:
			string = hour + ':' + string
			break
		case 2:
	}

	if(string.match(/'/g)?.length) {
		let parts = string.split('\'')
		let n = Number(parts[1])
		if (n < 1 || n > 24) throw 'Frame number must be between 1 and 24, was ' + n
		string = parts[0] + ',' + paddr3(`${n / 24.0}`.slice(2, 5))
	} else if (string.match(/./g)?.length) {
		let parts = string.split('.')
		parts[1] ??= ''
		parts[1] = paddr3(parts[1])
		string = parts[0] + ',' + parts[1]
	} else string = string + ',000'

	let parts = string.split(',')
	let nums = parts[0].split(':')
	let out = ''

	out += nums[0].length === 1 ? '0' + nums[0] + ':' : nums[0] + ':'
	out += nums[1].length === 1 ? '0' + nums[1] + ':' : nums[1] + ':'
	out += nums[2].length === 1 ? '0' + nums[2] + ',' : nums[2] + ','

	return out + parts[1]
}

function paddr3(num) {
	switch (num.length) {
		case 0 : num += '0' /// fallthrough
		case 1 : num += '0' /// fallthrough
		case 2 : num += '0' /// fallthrough
		case 3 : break
		default: throw 'Number too long: \'' + string + '\''
	}
	return num
}

function paddl2(num) {
	switch (num.length) {
		case 0 : num = '0' + num /// fallthrough
		case 1 : num = '0' + num /// fallthrough
		case 2 : break
		default: throw 'Number too long: \'' + string + '\''
	}
	return num
}

function person_marking(char) {
	switch (char) {
		case 'Ŋ': return '<font color="#ffffff"><b>'
		case 'Æ': return '<font color="#ffd200"><b>'
		case 'K': return '<font color="#e391b7"><b>'
		case 'B': return '<font color="#1abc9c"><b>'
		case 'Q': return '<font color="#344cdb"><b>'
		case 'M': return '<font color="#3498db"><b>'
		case 'S': return '<font color="#d68c3b"><b>'
		case '?': return '<font color="#606060"><b>'
		default : throw `Unknown person '${char}'`
	}
}
/// @formatter:on

