/** @preserve test-node-module */
import buffer from 'node:buffer';

const data = buffer.Buffer.from('\x1b\x4d\x03\x04\x41\x05').toString('base64');

export default data;
