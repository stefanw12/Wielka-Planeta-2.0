const LICZBAPLANET = 11;//bo z graczem
let planety = [];
let Planeta = function (x, y, promien) {
    this.x = x;
    this.y = y;
    this.promien = promien
    this.PREDKOSC = 0.25
};

let gracz = new Planeta(100, 100, 50);
planety.push(gracz);
while (planety.length < LICZBAPLANET) {
    let nowyPromien = Math.floor(Math.random() * 75) + 50;
    let nowyX = Math.floor(Math.random() * (SZER - nowyPromien));
    let nowyY = Math.floor(Math.random() * (WYS - nowyPromien));
    let kolizja = false;
    if (nowyX < nowyPromien) {
        nowyX += nowyPromien
    }
    if (nowyY < nowyPromien) {
        nowyY += nowyPromien
    }
    planety.forEach(planeta => {
        if (sprawdzKolizjeKuli(planeta.x, nowyX, planeta.y, nowyY, planeta.promien, nowyPromien)) { kolizja = true };
    })
    if (!kolizja) {
        planety.push(new Planeta(nowyX, nowyY, nowyPromien));
    }
};

Planeta.prototype.przesuwaj = function (kierunek, timeDiff) {
    if ((kierunek[KLAWISZE["GORA"]] || kierunek[KLAWISZE["W"]])
        && !(this.y < this.promien + 10) && !sprawdzKolizjeObiektow(gracz.x, gracz.y - this.PREDKOSC * timeDiff, gracz.promien, planety)) {
        this.y -= this.PREDKOSC * timeDiff
    }
    if ((kierunek[KLAWISZE["DOL"]] || kierunek[KLAWISZE["S"]])
        && !(this.y > WYS - this.promien - 10) && !sprawdzKolizjeObiektow(gracz.x, gracz.y + this.PREDKOSC * timeDiff, gracz.promien, planety)) {
        this.y += this.PREDKOSC * timeDiff
    }
    if ((kierunek[KLAWISZE["LEWA"]] || kierunek[KLAWISZE["A"]])
        && !(this.x < this.promien + 10) && !sprawdzKolizjeObiektow(gracz.x - this.PREDKOSC * timeDiff, gracz.y, gracz.promien, planety)) {
        this.x -= this.PREDKOSC * timeDiff
    }
    if ((kierunek[KLAWISZE["PRAWA"]] || kierunek[KLAWISZE["D"]])
        && !(this.x > SZER - this.promien - 10) && !sprawdzKolizjeObiektow(gracz.x + this.PREDKOSC * timeDiff, gracz.y, gracz.promien, planety)) {
        this.x += this.PREDKOSC * timeDiff
    };
};

Planeta.prototype.rysuj = function (numerPlanety) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.promien, 0, Math.PI * 2);
    ctx.fillStyle = "magenta"; //placeholder
    ctx.fill();
    ctx.fillStyle = "yellow"
    ctx.fillRect(this.x, this.y, 10, 10)//debug
    if (numerPlanety === 0) {
        tekst("PLACEHOLDER GRACZ", this.x, this.y, this.promien * 0.20, "white");
    } else {
        tekst(`PLACEHOLDER ${numerPlanety}`, this.x, this.y, this.promien * 0.25, "white");
    }
};
