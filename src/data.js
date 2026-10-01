import grubaGradnjaImage from "../Modern House Rising Above the Waterfront.png";
import temeljiBetonImage from "../Golden-Hour Foundation Framework (1).png";
import zidanjeImage from "../Golden-Hour Bricklaying at Sunset.png";
import krovoviImage from "../5ba0da87-a3c3-417b-b3fe-469faa0a0071.png";

export const PHONE = "+38267058382";
export const DISPLAY_PHONE = "+382 67 058 382";
export const EMAIL = "radonjic001@gmail.com";

export const projects = [
  {
    number: "01",
    title: "Gruba gradnja",
    category: "Konstrukcija",
    image: grubaGradnjaImage,
    provider: "local",
    position: "center 50%",
    fallback: grubaGradnjaImage,
    text: "Temelji, ploče, zidovi i kompletna nosiva konstrukcija objekta."
  },
  {
    number: "02",
    title: "Temelji i beton",
    category: "Betonski radovi",
    image: temeljiBetonImage,
    provider: "local",
    position: "center 54%",
    fallback: temeljiBetonImage,
    text: "Priprema, armiranje i betoniranje sa urednom geometrijom i jasnim fazama rada."
  },
  {
    number: "03",
    title: "Zidanje",
    category: "Zidovi",
    image: zidanjeImage,
    provider: "local",
    position: "center 50%",
    fallback: zidanjeImage,
    text: "Nosivi i pregradni zidovi, otvori i priprema za naredne faze objekta."
  },
  {
    number: "04",
    title: "Krovovi",
    category: "Krov",
    image: krovoviImage,
    provider: "local",
    position: "center 48%",
    fallback: krovoviImage,
    text: "Krovna konstrukcija, izolacija, letvanje i završno pokrivanje."
  }
];

export const services = [
  { code: "01", key: "shell", title: "Gruba gradnja", text: "Temelji, armatura, beton, ploče i kompletna nosiva konstrukcija.", image: grubaGradnjaImage },
  { code: "02", key: "foundation", title: "Temelji", text: "Iskop, priprema, armiranje, temeljne trake i temeljna ploča.", image: temeljiBetonImage },
  { code: "03", key: "concrete", title: "Betonski radovi", text: "Stubovi, grede, ploče i drugi armirano-betonski elementi.", image: temeljiBetonImage },
  { code: "04", key: "masonry", title: "Zidanje", text: "Nosivi i pregradni zidovi, otvori, nadvoji i priprema za fasadu.", image: zidanjeImage },
  { code: "05", key: "roof", title: "Krovovi", text: "Krovna konstrukcija, izolacija, letvanje, opšavi i pokrivanje.", image: krovoviImage },
  { code: "06", key: "fence", title: "Ograde", text: "Betonske i metalne ograde sa urednim završnim detaljima." },
  { code: "07", key: "plinth", title: "Coklovi", text: "Izrada i završna obrada cokla i donje zone objekta." },
  { code: "08", key: "demolition", title: "Rušenje", text: "Kontrolisano uklanjanje zidova, plafona i postojećih elemenata." },
  { code: "09", key: "prep", title: "Pripremni radovi", text: "Skidanje pločica, parketa i podloga prije novih radova." }
];
