function validateThaiID(id) {
    if (id.length != 13) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += parseFloat(id.charAt(i)) * (13 - i);
    }
    let check = (11 - (sum % 11)) % 10;
    return check == parseFloat(id.charAt(12));
}

console.log("ID_CHECK: 4310100001149 =", validateThaiID("4310100001149"));
