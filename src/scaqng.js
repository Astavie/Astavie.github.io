var numerals = [
    {dec: 1296, num: "ž"}, // Žnočún
    {dec: 648, num: "p"}, // variation on uM
    {dec: 216, num: "š"}, // Šun
    {dec: 108, num: "s"}, // variation on uM
    {dec: 36, num: "f"}, // Fež
    {dec: 18, num: "n"}, // variation on uM
    {dec: 6, num: "r"}, //  Jeqàg (used to be an R in the past)
    {dec: 3, num: "m"}, // uM
    {dec: 1, num: "|"} // Looks like 1
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

