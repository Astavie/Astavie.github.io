var numerals = [
    {dec: 36, num: "f"},
    {dec: 18, num: "n"},
    {dec: 6, num: "r"},
    {dec: 3, num: "m"},
    {dec: 1, num: "|"}
]

function convert() {
    let decimal = document.getElementById("decimal").value || 0;
    let number = "";
    
    if (decimal != 0) {
        for (const pair of numerals) {
            while (decimal >= pair.dec) {
                decimal -= pair.dec;
                number += pair.num;
            }
            if (decimal == 0) {
                break;
            }
        }
    }
    
    $("#answer").html(number);
    return false;
}

