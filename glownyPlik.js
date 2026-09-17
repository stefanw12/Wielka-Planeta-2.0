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
const LICZBAGWIAZDEK = 500;
const LICZBAPLANET = 15;
const LICZBAKS = LICZBAPLANET;
const STARTMINIMAPX = SZER - 325;
const STARTMINIMAPY = 30;
let miniMapX = SZER - 300;
let miniMapY = 30;
let reqId = 0;
let pauza = false;
let pokazFps = false;
let worldX = 0;
let worldY = 0;
let kierunek = 0;
let stareReqId = 0;
let fps = 60;
let kolor = 0;
let zoom = 100;
let centerX = SZER / 2
let centerY = WYS / 2
let gwiazdki = [];
let ksiezyce = [];
let planety = [];
let gracze = [];
let obiekty = [planety, ksiezyce, gracze];
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
    "R": 82,
    "P": 80,
};
let wcisniete = { 37: false, 38: false, 39: false, 40: false, 87: false, 65: false, 83: false, 68: false, 80: false };
$("#wznowGre").hide();
$("#wznowGre").css("top", `${centerY - 100}px`);
$("#wznowGre").css("left", `${centerX - 250}px`);
$("#wznowGre").hover(function () {
    $("#wznowGre a").css("background-color", "white");
    $("#wznowGre a").css("color", "black");
}, function () {
    $("#wznowGre a").css("color", "white");
    $("#wznowGre a").css("background", "black");
});
$("#togleFps").hide();
$("#togleFps").css("top", `${centerY}px`);
$("#togleFps").css("left", `${centerX - 225}px`);
$("#togleFps").hover(function () {
    $("#togleFps a").css("background-color", "white");
    $("#togleFps a").css("color", "black");
}, function () {
    $("#togleFps a").css("color", "white");
    $("#togleFps a").css("background", "black");
});
$("#togleFps").click(function () {
    if (pokazFps) {
        pokazFps = false;
        $("#fps").hide();
    } else {
        pokazFps = true;
        $("#fps").show();
    }
});
$("#fps").hide();
$("debugMode").hide();
$("#debugMode").css("top", `${centerY - 100}px`);
$("#debugMode").css("left", `${centerX - 250}px`);
$("#debugMode").hover(function () {
    $("#debugMode a").css("background-color", "white");
    $("#debugMode a").css("color", "black");
}, function () {
    $("#debugMode a").css("color", "white");
    $("#debugMode a").css("background", "black");
});

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
    if (zdarzenie.keyCode === KLAWISZE["R"]) {
        zoom = 100;
    }
});

addEventListener("wheel", (zdarzenie) => {
    zoom -= zdarzenie.deltaY * 0.1;
    if (zoom > 170) {
        zoom = 170;
    }
    if (zoom < 60) {
        zoom = 60;
    }
})

let odleglosc = function (x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2))
}

let sprawdzKolizjeKuli = function (x1, x2, y1, y2, promien1, promien2) {
    if (odleglosc(x1, x2, y1, y2) < promien1 + promien2 && odleglosc(x1, x2, y1, y2) > 0) {
        return true;
    } else {
        return false;
    }
};

let sprawdzKolizjeObiektowBolean = function (x, y, promien, lista = obiekty, zGraczem = false) {
    return lista.flat().some(element => (element != gracz || zGraczem) && sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien));
};

let sprawdzKolizjeObiektowObject = function (x, y, promien, lista = obiekty) {
    return lista.flat().find((element) => sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien));
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
    const zoomX = gracz.x * zoom / 100;
    const zoomY = gracz.y * zoom / 100;
    if (zoomX > centerX && zoomX < BUFORSZER - centerX) {
        worldX = -zoomX + centerX;
    } else if (zoomX < centerX) {
        worldX = 0;
    } else if (zoomX > SZER - centerX) {
        worldX = -BUFORSZER + centerX * 2;
    }
    if (zoomY > centerY && zoomY < BUFORWYS - centerY) {
        worldY = -zoomY + centerY;
    } else if (zoomY < centerY) {
        worldY = 0;
    } else if (zoomY > WYS - centerY) {
        worldY = -BUFORWYS + centerY * 2;
    }
};

function generuj(lista, ile, obiekt, minProm, maxProm) {
    while (lista.length < ile) {
        let nowyPromien = Math.floor(Math.random() * maxProm) + minProm;
        let nowyX = Math.floor(Math.random() * (BUFORSZER - nowyPromien * 4));
        let nowyY = Math.floor(Math.random() * (BUFORWYS - nowyPromien * 4));
        let kolizja = false;
        if (nowyX < nowyPromien * 4) {
            nowyX = nowyPromien * 4
        }
        if (nowyY < nowyPromien * 4) {
            nowyY = nowyPromien * 4
        }
        lista.forEach(element => {
            if (sprawdzKolizjeKuli(element.x, nowyX, element.y, nowyY, element.promien + element.ks.odl, nowyPromien)) { kolizja = true };
        })
        obiekty.forEach(element => {
            if (element != lista) {
                if (sprawdzKolizjeObiektowBolean(nowyX, nowyY, nowyPromien, element, true)) { kolizja = true }
            }
        })
        if (!kolizja) {
            lista.push(new obiekt(nowyX, nowyY, nowyPromien));
        }
    }
};

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

/*     ##############
       ## KSIĘŻYCE ##
       ##############  */

let Ksiezyc = function (planeta) {
    this.x = planeta.x + planeta.promien * 3;
    this.y = planeta.y;
    this.promien = planeta.promien * 0.4;
    this.kat = 0;
    this.odl = planeta.promien * 3;
    this.predkosc = 0.001 * (this.promien / 2) * Math.random();
    this.planeta = planeta
    this.kolor = "rgb(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")";
    if (this.predkosc < 0.00055) {
        this.predkosc = 0.00055;
    }
};

Ksiezyc.prototype.rysuj = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.promien, 0, Math.PI * 2);
    ctx.fillStyle = this.kolor;
    ctx.fill();
}

Ksiezyc.prototype.przesuwaj = function () {
    this.kat += this.predkosc;
    this.x = this.odl * Math.cos(this.kat) + this.planeta.x;
    this.y = this.odl * Math.sin(this.kat) + this.planeta.y;
    if (sprawdzKolizjeKuli(this.x, gracz.x, this.y, gracz.y, this.promien, gracz.promien)) {
        gracz.x
        gracz.y
    }
};

/*     ###########
       ## GRACZ ##
       ###########   */

let Gracz = function (x, y, promien) {
    this.x = x;
    this.y = y;
    this.promien = promien
    this.PREDKOSC = 0.25
};
let gracz = new Gracz(100, 100, 50, false);
gracze.push(gracz);

Gracz.prototype.przesuwaj = function (timeDiff) {
    let predkoscRzecz = this.PREDKOSC * timeDiff;
    if ((wcisniete[KLAWISZE["GORA"]] || wcisniete[KLAWISZE["W"]])
        && !(this.y < this.promien + predkoscRzecz) && !obsługaKolizji(0, -predkoscRzecz, this.x, this.y, this.promien)) {
        this.y -= predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["DOL"]] || wcisniete[KLAWISZE["S"]])
        && !(this.y > BUFORWYS - this.promien - predkoscRzecz) && !obsługaKolizji(0, predkoscRzecz, this.x, this.y, this.promien)) {
        this.y += predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["LEWA"]] || wcisniete[KLAWISZE["A"]])
        && !(this.x < this.promien + predkoscRzecz) && !obsługaKolizji(-predkoscRzecz, 0, this.x, this.y, this.promien)) {
        this.x -= predkoscRzecz
    }
    if ((wcisniete[KLAWISZE["PRAWA"]] || wcisniete[KLAWISZE["D"]])
        && !(this.x > BUFORSZER - this.promien - predkoscRzecz) && !obsługaKolizji(predkoscRzecz, 0, this.x, this.y, this.promien)) {
        this.x += predkoscRzecz
    };
};

Gracz.prototype.rysuj = function () {
    let iloscOkregow = this.promien / 12;
    for (i = 0; i < iloscOkregow; i++) {
        let promienOkregu = this.promien - i * i * 7;
        if (promienOkregu <= 0) {
            promienOkregu = 1;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, promienOkregu, 0, Math.PI * 2);
        if (i % 2 === Math.floor(kolor) % 2) {
            ctx.fillStyle = "brown";
        } else {
            ctx.fillStyle = "orange"
        }

        ctx.fill();
    }
    //tekst("PLACEHOLDER GRACZ", this.x, this.y, this.promien * 0.20, "white");
};

let obsługaKolizji = function (korektaX, korektaY, x, y, promien) {
    return obiekty.flat().some(element => element != gracz && element.promien * 2 > promien && sprawdzKolizjeKuli(x + korektaX, element.x, y + korektaY, element.y, promien, element.promien));
};

Gracz.prototype.wchlon = function (promien, x, y) {
    if (planety.some(element => element.promien * 2 <= promien && sprawdzKolizjeObiektowBolean(x, y, promien, planety))) {
        this.promien += sprawdzKolizjeObiektowObject(x, y, promien, planety).promien * 0.5;
        planety.splice(planety.findIndex(element => sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien)), 1);
    }
    if (ksiezyce.some(element => element.promien * 2 <= promien && sprawdzKolizjeObiektowBolean(x, y, promien, ksiezyce))) {
        this.promien += sprawdzKolizjeObiektowObject(x, y, promien, ksiezyce).promien * 0.5;
        ksiezyce.splice(ksiezyce.findIndex(element => sprawdzKolizjeKuli(x, element.x, y, element.y, promien, element.promien)), 1);
    }
};

/*     #############
       ## PLANETY ##
       #############   */

let Planeta = function (x, y, promien) {
    this.x = x;
    this.y = y;
    this.promien = promien;
    this.ks = new Ksiezyc(this);
    this.kolor = "rgba(" + Math.random() * 255 + "," + Math.random() * 255 + "," + Math.random() * 255 + ")"
};

generuj(planety, LICZBAPLANET, Planeta, 50, 75);

Planeta.prototype.rysuj = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.promien, 0, Math.PI * 2);
    ctx.fillStyle = (this.kolor); //placeholder
    ctx.fill();
};

for (let i = 0; i < planety.length; i++) {
    ksiezyce.push(planety[i].ks);
}

/*     #########
       ## GRA ##
       #########   */

let gra = function (lastTime) {
    kolor += 0.2;
    let time = Date.now();
    let timeDiff = time - lastTime;

    ctx.clearRect(0, 0, SZER, WYS);
    rysujNiebo(gracz.x, gracz.y);
    gracz.przesuwaj(timeDiff);
    gracz.wchlon(gracz.promien, gracz.x, gracz.y);
    gracz.rysuj();
    aktWspolrzSw();
    planety.forEach(planeta => {
        planeta.rysuj();
    });
    ksiezyce.forEach(ksiezyc => {
        ksiezyc.rysuj();
        ksiezyc.przesuwaj();
    })

    if (wcisniete[KLAWISZE["S"]] == true && wcisniete[KLAWISZE["P"]] == true && wcisniete[KLAWISZE["D"]] == true) {
        gracz.PREDKOSC = prompt("podaj nową prędkość(bazowa to 0.25)");
        Object.keys(wcisniete).forEach(element => wcisniete[element] = false);
    }

    if (pauza === false) {
        reqId = window.requestAnimationFrame(function () {
            gra(time);
        })
    } else if (pauza === true) { //pauza
        tekst("PAUZA", centerX, centerY - 120, 100, "white", true, "black");
        $("#wznowGre").show();
        $("#togleFps").show();
        $("#debugMode").show();
        $("#wznowGre").click(function () {
            pauza = false;
            window.cancelAnimationFrame(reqId);
            gra(time);
            $("#wznowGre").hide();
            $("#togleFps").hide();
        });
    };
    canvasCtx.clearRect(0, 0, SZER, WYS);
    canvasCtx.drawImage(bufor, worldX, worldY, BUFORSZER * zoom * 0.01, BUFORWYS * zoom * 0.01);
    canvasCtx.fillStyle = "black";
    canvasCtx.strokeStyle = "white";
    canvasCtx.lineWidth = 4;
    canvasCtx.fillRect(SZER - 320, 20, 300, 200);
    canvasCtx.strokeRect(SZER - 320, 20, 300, 200);
    canvasCtx.drawImage(bufor, SZER - 320, 20, 300, 200)
    ctx.clearRect(0, 0, BUFORSZER, BUFORWYS);
    $("#fps").text(fps + " fps");
};

gra(STARTTIME);
setInterval(function () {
    fps = reqId - stareReqId;
    stareReqId = reqId;
}, 1000);

