const STARTTIME = Date.now();
const canvas = document.getElementById("canvas");
const bufor = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = bufor.getContext("2d");
const canvasCtx = canvas.getContext("2d");
const SZER = canvas.width;
const WYS = canvas.height;
const BUFORSZER = 3000;
const BUFORWYS = 2000;
bufor.width = BUFORSZER;
bufor.height = BUFORWYS;
const CENTERX = SZER / 2;
const CENTERY = WYS / 2;
const LICZBAGWIAZDEK = 500;
const LICZBAPLANET = 11;//bo z graczem
const LICZBAKS = LICZBAPLANET - 1;
let planety = [];
let reqId = 0;
let pauza = false;
let pokazFps = false;
let worldX = 0;
let worldY = 0;
let kierunek = 0;
let stareReqId = 0;
let gwiazdki = [];
let ksiezyce = [];
let obiekty = [planety, ksiezyce]
let KLAWISZE = {
    "LEWA": 37,
    "GORA": 38,
    "DOL": 40,
    "PRAWA": 39,
    "ESC": 27,
    "W": 87,
    "A": 65,
    "S": 83,
    "D": 68,
};
let wcisniete = { 37: false, 38: false, 39: false, 40: false, 87: false, 65: false, 83: false, 68: false };
$("#wznowGre").hide();
$("#wznowGre").css("top", `${CENTERY - 100}px`);
$("#wznowGre").css("left", `${CENTERX - 250}px`);
$("#wznowGre").hover(function () {
    $("#wznowGre a").css("background-color", "white");
    $("#wznowGre a").css("color", "black");
}, function () {
    $("#wznowGre a").css("color", "white");
    $("#wznowGre a").css("background", "black");
});
$("#togleFps").hide();
$("#togleFps").css("top", `${CENTERY}px`);
$("#togleFps").css("left", `${CENTERX - 225}px`);
$("#togleFps").hover(function () {
    $("#togleFps a").css("background-color", "white");
    $("#togleFps a").css("color", "black");
}, function () {
    $("#togleFps a").css("color", "white");
    $("#togleFps a").css("background", "black");
});
$("#togleFps").click(function () {
    console.log("aaaaaaaa")
    if (pokazFps) {
        pokazFps = false;
        $("#fps").hide();
    } else {
        pokazFps = true;
        $("#fps").show();
    }
});
$("#fps").hide();

$(document).keydown(function (zdarzenie) {
    if (zdarzenie.keyCode in wcisniete && !pauza) {
        wcisniete[zdarzenie.keyCode] = true;
    };
}).keyup(function (zdarzenie) {
    if (zdarzenie.keyCode in wcisniete) {
        wcisniete[zdarzenie.keyCode] = false;
    }
});

$(document).keydown(function (zdarzenie) {
    if (zdarzenie.keyCode === KLAWISZE["ESC"]) {
        pauza = true;
    }
});

let odleglosc = function (x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2))
}

let sprawdzKolizjeKuli = function (x1, x2, y1, y2, promien1, promien2, kolizja) {
    if (odleglosc(x1, x2, y1, y2) < promien1 + promien2) {
        return kolizja = true;
    } else {
        return kolizja = false;
    }
};

let sprawdzKolizjeObiektow = function (x, y, promien, lista) {
    if (!lista) {
        return obiekty.some(obiekt => obiekt.some(element => element != gracz && sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien)));
    } else {
        return lista.some(element => element != gracz && sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien));
    }
};

let tekst = function (tekst, x, y, rozmiar, kolor, ramka = false, kolorRamki) {
    if (ramka) {
        ctx.fillStyle = kolorRamki
        ctx.fillRect(x - rozmiar * 1.75, y + 13, rozmiar * tekst.length * 0.69, -rozmiar + 5)
    }
    ctx.fillStyle = kolor;
    ctx.textAlign = "center";
    ctx.font = `${rozmiar}px Times New Roman`;
    ctx.fillText(tekst, x, y);
};

let aktWspolrzSw = function () {
    if (gracz.x > CENTERX && gracz.x < BUFORSZER - CENTERX) {
        worldX = -gracz.x + CENTERX;
    } else if (gracz.x < CENTERX) {
        worldX = 0;
    } else if (gracz.x > SZER - CENTERX) {
        worldX = -BUFORSZER + CENTERX * 2;
    }
    if (gracz.y > CENTERY && gracz.y < BUFORWYS - CENTERY) {
        worldY = -gracz.y + CENTERY;
    } else if (gracz.y < CENTERY) {
        worldY = 0;
    } else if (gracz.y > WYS - CENTERY) {
        worldY = -BUFORWYS + CENTERY * 2;
    }
};

function generuj(lista, ile, obiekt, minProm, maxProm) {
    while (lista.length < ile) {
        let nowyPromien = Math.floor(Math.random() * maxProm) + minProm;
        let nowyX = Math.floor(Math.random() * (BUFORSZER - nowyPromien));
        let nowyY = Math.floor(Math.random() * (BUFORWYS - nowyPromien));
        let kolizja = false;
        if (nowyX < nowyPromien) {
            nowyX += nowyPromien
        }
        if (nowyY < nowyPromien) {
            nowyY += nowyPromien
        }
        lista.forEach(element => {
            if (sprawdzKolizjeKuli(element.x, nowyX, element.y, nowyY, element.promien, nowyPromien)) { kolizja = true };
        })
        obiekty.forEach(element => {
            if (element != lista) {
                if (sprawdzKolizjeObiektow(nowyX, nowyY, nowyPromien, element)) {kolizja = true}
            }
        })
        if (!kolizja) {
            lista.push(new obiekt(nowyX, nowyY, nowyPromien));
        }
    };
}

/*     ##############
       ## GWIAZDKI ##
       ##############  */

for (let i = 0; i <= LICZBAGWIAZDEK; i++) {
    gwiazdki.push({
        x: Math.floor(Math.random() * BUFORSZER),
        y: Math.floor(Math.random() * BUFORWYS),
        z: Math.random() * 0.1
    });
};

let rysujNiebo = function () {
    gwiazdki.forEach(gwiazdka => {
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.arc(gwiazdka.x + gracz.x * gwiazdka.z, gwiazdka.y + gracz.y * gwiazdka.z, 45 * gwiazdka.z, 0, 2 * Math.PI);
        ctx.fill();
    });
};

/*     #############
       ## PLANETY ##
       #############   */

let Planeta = function (x, y, promien) {
    this.x = x;
    this.y = y;
    this.promien = promien
    this.PREDKOSC = 0.25
};

let gracz = new Planeta(100, 100, 50);
planety.push(gracz);

generuj(planety, LICZBAPLANET, Planeta, 50, 75);

Planeta.prototype.przesuwaj = function (timeDiff) {
    let predkoscRzecz = this.PREDKOSC * timeDiff;
    if ((wcisniete[KLAWISZE["GORA"]] || wcisniete[KLAWISZE["W"]])
        && !(this.y < this.promien + predkoscRzecz) && !sprawdzKolizjeObiektow(gracz.x, gracz.y - this.PREDKOSC * timeDiff, gracz.promien)) {
        this.y -= predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["DOL"]] || wcisniete[KLAWISZE["S"]])
        && !(this.y > BUFORWYS - this.promien - predkoscRzecz) && !sprawdzKolizjeObiektow(gracz.x, gracz.y + this.PREDKOSC * timeDiff, gracz.promien)) {
        this.y += predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["LEWA"]] || wcisniete[KLAWISZE["A"]])
        && !(this.x < this.promien + predkoscRzecz) && !sprawdzKolizjeObiektow(gracz.x - this.PREDKOSC * timeDiff, gracz.y, gracz.promien)) {
        this.x -= predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["PRAWA"]] || wcisniete[KLAWISZE["D"]])
        && !(this.x > BUFORSZER - this.promien - predkoscRzecz) && !sprawdzKolizjeObiektow(gracz.x + this.PREDKOSC * timeDiff, gracz.y, gracz.promien)) {
        this.x += predkoscRzecz
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

/*     ##############
       ## KSIĘŻYCE ##
       ##############  */

let Ksiezyc = function (x, y, promien) {
    this.x = x
    this.y = y
    this.promien = promien
};

Ksiezyc.prototype.rysuj = function (numerKs) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.promien, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(255, 0, 200)"
    ctx.fill();
    tekst("KSIĘŻYC " + numerKs, this.x, this.y, this.promien * 0.4, "white");
}

generuj(ksiezyce, LICZBAKS, Ksiezyc, 20, 75);

/*     #########
       ## GRA ##
       #########   */

let gra = function (lastTime) {
    //console.log(reqId)
    let time = Date.now();
    let timeDiff = time - lastTime;

    ctx.clearRect(0, 0, SZER, WYS);
    gracz.przesuwaj(timeDiff);
    aktWspolrzSw();
    rysujNiebo(gracz.x, gracz.y);
    ctx.strokeStyle = "white"
    ctx.lineWidth = 4
    let najblizszaPlaneta = {
        odleglosc: odleglosc(gracz.x, planety[1].x, gracz.y, planety[1].y),
        x: planety[1].x,
        y: planety[1].y
    }
    
    planety.forEach(planeta => {
        if (planeta != gracz) {
            let odl = odleglosc(gracz.x, planeta.x, gracz.y, planeta.y)
            if (odl < najblizszaPlaneta.odleglosc) {
                najblizszaPlaneta = {
                    x: planeta.x,
                    y: planeta.y,
                    odleglosc: odl,
                }
            }
        }
    })

    ctx.beginPath()
    ctx.moveTo(gracz.x, gracz.y)
    ctx.lineTo(najblizszaPlaneta.x, najblizszaPlaneta.y)
    ctx.stroke()

    planety.forEach(planeta => {
        planeta.rysuj(planety.indexOf(planeta));
    });
    ksiezyce.forEach(ksiezyc => {
        ksiezyc.rysuj(ksiezyce.indexOf(ksiezyc));
    })

    if (pauza === false) {
        reqId = window.requestAnimationFrame(function () {
            gra(time);
        })
    } else if (pauza === true) { //pauza
        tekst("PAUZA", CENTERX, CENTERY - 120, 100, "white", true, "black");
        $("#wznowGre").show();
        $("#togleFps").show();
        $("#wznowGre").click(function () {
            pauza = false;
            window.cancelAnimationFrame(reqId);
            gra(time);
            $("#wznowGre").hide();
            $("#togleFps").hide();
        });
    };
    canvasCtx.clearRect(0, 0, SZER, WYS);
    canvasCtx.drawImage(bufor, worldX, worldY);
    ctx.clearRect(0, 0, BUFORSZER, BUFORWYS);
};

gra(STARTTIME);
setInterval(function () {
    let fps = reqId - stareReqId;
    stareReqId = reqId;
    $("#fps").text(fps + " fps");
}, 1000);
