let expect = require('expect');

let {generateMessage, generateLocationMessage } = require('./message');
const { text } = require("express");

describe('generate message', () => {
  it('should generate message correctly', () => {
    let from = "Matevz",
        text = "Hello World!"
        message = generateMessage(from, text);

    expect.expect(typeof message.createdAt).toBe('number');
    expect.expect(message).toMatchObject({ from,text });
  })
});

describe('generate location correctly', () => {
  it('should generate location correctly', () => {
    let from = "Matevz",
        lat = 15,
        lng = 56,
        url = `https://www.google.com/maps?q=${lat}, ${lng}`,
        message = generateLocationMessage(from, lat, lng);

    expect.expect(typeof message.createdAt).toBe('number');
    expect.expect(message).toMatchObject({ from, url });
  })
})
