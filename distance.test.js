const getDistance = require("./getDistance");
test("Returns distance between two", () => {
    expect(getDistance(-60, 90, 30, -20)).toBe('13958.16');
});

test("Returns distance between two", () => {
    expect(getDistance(42, 98, -22, -79)).toBe('17773.66');
});

test("Returns distance between two", () => {
    expect(getDistance(30, -88, 47, 20)).toBe('8833.99');
});