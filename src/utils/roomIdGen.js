module.exports = {
    //Internal method
    compareHexValues(hexValue1, hexValue2) {
        const value1 = parseInt(hexValue1, 16);
        const value2 = parseInt(hexValue2, 16);

        return value1 < value2 ? hexValue1 + '' + hexValue2 : hexValue2 + '' + hexValue1;
    }
}