-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  dimension TEXT NOT NULL,
  weight FLOAT NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create parties table
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  coordinates FLOAT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_dimension ON questions(dimension);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- Insert party data
INSERT INTO parties (name, description, coordinates) VALUES
-- [economic, social, nationalism, traditionalism, regionalism]
('Srpska napredna stranka (SNS)', 'vladajuća stranka, centar-desno, autoritarni populizam', ARRAY[0.5, -1.5, 0.5, 0.5, -1.5]),
('Socijalistička partija Srbije (SPS)', 'koalicioni partner, levi populizam, proruski', ARRAY[-1.0, -1.0, 1.0, 0.5, -1.0]),
('Stranka slobode i pravde (SSP)', 'Đilas, opozicija, centar-levica, EU orijentacija', ARRAY[-0.5, 0.5, -1.0, -0.5, 0.0]),
('Zeleno-levi front (ZLF)', 'ekološka levica, mladi, progresivna opozicija', ARRAY[-1.5, 1.5, -1.5, -1.5, 0.5]),
('Narodni pokret Srbije', 'nova opozicija, centar', ARRAY[0.0, 0.0, 0.0, 0.0, 0.0]),
('Dveri', 'krajnja desnica, nacionalizam, tradicionalizam', ARRAY[1.5, -1.0, 2.0, 2.0, -1.0]),
('Zavetnici', 'ultradesnica, suverenisti, desno od Dveri', ARRAY[2.0, -1.5, 2.0, 2.0, -1.5]),
('Pokret slobodnih građana (PSG)', 'centar-levica, građanski orijentisani, slabija baza', ARRAY[-0.5, 0.5, -0.5, -0.5, 0.0]),
('Srbija centar (SRCE)', 'nova centristička opozicija', ARRAY[0.0, 0.0, 0.0, 0.0, 0.0]),
('Dosta je bilo (DJB)', 'ranije libertarijanci, sada desni populizam', ARRAY[1.0, 0.0, 1.0, 1.0, -0.5]),
('Jedinstvena Srbija (JS)', 'Palma, populistički satelit SNS-a', ARRAY[-0.5, -1.0, 1.5, 1.0, -1.0]),
('Liga socijaldemokrata Vojvodine (LSV)', 'regionalna levica, autonomija Vojvodine', ARRAY[-1.0, 1.0, -1.0, -0.5, 2.0]);

-- Insert question data
INSERT INTO questions (text, dimension, weight) VALUES
-- EKONOMSKA DIMENZIJA (economic)
('Država treba da kontroliše cene osnovnih životnih namirnica i komunalija.', 'economic', 1.0),
('Privatizacija preostalih državnih preduzeća poput EPS-a i Telekoma bi bila dobra za ekonomiju Srbije.', 'economic', 1.5),
('Subvencije stranim investitorima (kao što su fabrike auto delova) su dobar način za razvoj ekonomije.', 'economic', 1.0),
('Treba povećati minimalnu zaradu, pa makar neki mali preduzetnici morali da zatvore svoje firme.', 'economic', 1.0),
('Penzije i socijalna davanja treba da budu veći, čak i ako to znači veće poreze.', 'economic', 1.0),
('Domaći poljoprivrednici treba da dobijaju veće subvencije i podršku države.', 'economic', 1.0),

-- SOCIJALNA DIMENZIJA (social)
('Potrebno je veće prisustvo države u medijskom prostoru radi sprečavanja lažnih vesti.', 'social', 1.5),
('Snažna opozicija je neophodna za zdravu demokratiju, čak i kada kritikuje vlast u kriznim vremenima.', 'social', 1.0),
('Legitimno je da država ima uvid u privatne komunikacije građana u cilju borbe protiv kriminala.', 'social', 1.0),
('Mediji kritički nastrojeni prema vlasti treba da imaju iste uslove kao i provladini mediji.', 'social', 1.0),
('Nezavisno sudstvo je važnije od brze i efikasne pravde.', 'social', 1.0),

-- NACIONALISTIČKA DIMENZIJA (nationalism)
('Srbija treba da bude deo Evropske unije čak i ako to znači promenu stava prema Kosovu.', 'nationalism', 1.5),
('Srbija treba da ima bliskiji odnos sa Rusijom nego sa zapadnim zemljama.', 'nationalism', 1.0),
('Spremnost NATO-a da bombarduje Srbiju 1999. godine i danas je razlog da budemo oprezni prema zapadu.', 'nationalism', 1.0),
('Srbija treba da se više oslanja na saradnju sa Kinom.', 'nationalism', 1.0),
('Srbija treba da ostane vojno neutralna i izvan NATO-a.', 'nationalism', 1.0),
('Zapadne vrednosti su strane srpskom identitetu i tradiciji.', 'nationalism', 1.0),

-- TRADICIONALISTIČKA DIMENZIJA (traditionalism)
('Poželjno je da deca uče veronauku u školi.', 'traditionalism', 1.0),
('Država treba da podržava i finansira Srpsku pravoslavnu crkvu.', 'traditionalism', 1.0),
('Država treba da podržava i finansira sve verske zajednice u proporcionalnoj meri, ne samo SPC.', 'traditionalism', 1.0),
('Tradicionalna porodica je temelj zdravog društva i treba je posebno zaštititi.', 'traditionalism', 1.0),
('LGBT osobe treba da imaju jednaka prava, uključujući i pravo na brak.', 'traditionalism', 1.5),
('Moderne vrednosti poput feminizma i LGBT prava ugrožavaju tradicionalne srpske vrednosti.', 'traditionalism', 1.0),
('Srbija treba da bude sekularna država u kojoj crkva nema uticaj na politiku.', 'traditionalism', 1.5),

-- EKOLOŠKA I REGIONALNA DIMENZIJA (regionalism)
('Podržavam iskopavanje litijuma u Srbiji uz ekološke garancije.', 'regionalism', 1.0),
('Za mene je neprihvatljiv rizik zagađenja vode i zemljišta u poređenju sa ekonomskom dobiti rudnika litijuma.', 'regionalism', 1.0),
('Vojvodina treba da ima veću autonomiju nego što trenutno ima.', 'regionalism', 1.5),
('Decentralizacija vlasti i jačanje lokalnih samouprava je neophodna za razvoj Srbije.', 'regionalism', 1.0),
('Beograd dobija previše sredstava u odnosu na ostale delove Srbije.', 'regionalism', 1.0),
('Lokalne vlasti treba da imaju više kontrole nad prirodnim resursima na svojoj teritoriji.', 'regionalism', 1.0); 