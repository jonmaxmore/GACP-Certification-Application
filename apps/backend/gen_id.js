function generateThaiID() {
    let id = "";
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        let digit = Math.floor(Math.random() * 10);
        id += digit;
        sum += digit * (13 - i);
    }
    let check = (11 - (sum % 11)) % 10;
    return id + check;
}

console.log("VALID_ID:", generateThaiID());
