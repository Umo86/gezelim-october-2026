/*
 * Sample content so the site can be judged before real events arrive.
 * Every record is fictional and flagged isSample; the site labels it "Örnek / Sample"
 * and keeps it out of Google. Remove it all with: npm run seed:clear
 */

export type SampleOrganiser = {
  key: string
  name: string
  bio: { tr: string; en: string }
  instagram?: string
  verified?: boolean
}

export type SampleVenue = {
  key: string
  name: string
  city: string
  town: string
  lat: number
  lng: number
}

export type SampleEvent = {
  /** Days from today (London). Use `fixedDate` for events tied to a calendar date. */
  day?: number
  fixedDate?: { month: number; day: number }
  time: string
  endTime?: string
  /** Extra days the event runs for (festivals). */
  span?: number
  city: string
  venue: string
  organiser: string
  category: string
  spoken: 'tr' | 'en' | 'both' | 'none'
  age?: 'all' | '16' | '18'
  free?: boolean
  priceFrom?: number
  priceTo?: number
  soldOut?: boolean
  status?: 'scheduled' | 'cancelled' | 'postponed' | 'rescheduled'
  featured?: boolean
  /** Name of a generated poster image to attach. */
  poster?: string
  performers?: Array<{ name: string; kind?: 'person' | 'group' }>
  title: { tr: string; en?: string }
  summary: { tr: string; en?: string }
  description: { tr: string; en?: string }
}

export const organisers: SampleOrganiser[] = [
  {
    key: 'anadolu',
    name: 'Anadolu Sahnesi',
    verified: true,
    instagram: '@anadolusahnesi.ornek',
    bio: {
      tr: 'Londra’da Anadolu rock’ı, türküler ve fasıl geceleri düzenleyen örnek bir organizasyon.',
      en: 'A sample organiser running Anatolian rock, folk and fasıl nights in London.',
    },
  },
  {
    key: 'kahkaha',
    name: 'Kahkaha Kulübü UK',
    verified: true,
    bio: {
      tr: 'Türkçe stand-up ve açık mikrofon geceleri düzenleyen örnek bir komedi kulübü.',
      en: 'A sample comedy club hosting Turkish stand-up and open mic nights.',
    },
  },
  {
    key: 'kuzey',
    name: 'Kuzey Türk Derneği',
    bio: {
      tr: 'Kuzey İngiltere’deki Türk aileleri bir araya getiren örnek bir dernek.',
      en: 'A sample association bringing Turkish families in the north of England together.',
    },
  },
  {
    key: 'lale',
    name: 'Lale Kültür Merkezi',
    verified: true,
    bio: {
      tr: 'Çocuklar ve aileler için kültür ve sanat etkinlikleri hazırlayan örnek bir merkez.',
      en: 'A sample centre making arts and culture events for children and families.',
    },
  },
  {
    key: 'bosphorus',
    name: 'Bosphorus Nights',
    instagram: '@bosphorusnights.sample',
    bio: {
      tr: 'Türkçe pop ve halay partileri yapan örnek bir parti ekibi.',
      en: 'A sample party crew throwing Turkish pop and halay nights.',
    },
  },
  {
    key: 'girisim',
    name: 'Türk Girişimciler Ağı',
    bio: {
      tr: 'İngiltere’deki Türk girişimciler için buluşmalar düzenleyen örnek bir ağ.',
      en: 'A sample network running meetups for Turkish founders in the UK.',
    },
  },
  {
    key: 'iskocya',
    name: 'İskoçya Türk Topluluğu',
    bio: {
      tr: 'Edinburg ve Glasgow’da topluluk buluşmaları yapan örnek bir grup.',
      en: 'A sample group running community get-togethers in Edinburgh and Glasgow.',
    },
  },
]

export const venues: SampleVenue[] = [
  { key: 'lale-hall', name: 'Lale Hall', city: 'london', town: 'Harringay', lat: 51.5776, lng: -0.0985 },
  { key: 'cinar', name: 'Çınar Studio', city: 'london', town: 'Dalston', lat: 51.5465, lng: -0.0753 },
  { key: 'kervan', name: 'Kervan Sahne', city: 'london', town: 'Wood Green', lat: 51.5975, lng: -0.1097 },
  { key: 'bogazici', name: 'Boğaziçi Club', city: 'london', town: 'Shoreditch', lat: 51.5246, lng: -0.0794 },
  { key: 'ada', name: 'Ada Room', city: 'london', town: 'Enfield', lat: 51.6523, lng: -0.0807 },
  { key: 'nq-loft', name: 'Northern Quarter Loft', city: 'manchester', town: 'Northern Quarter', lat: 53.4839, lng: -2.2361 },
  { key: 'digbeth', name: 'Digbeth Arts Space', city: 'birmingham', town: 'Digbeth', lat: 52.4751, lng: -1.8853 },
  { key: 'kirkgate', name: 'Kirkgate Hall', city: 'leeds', town: 'City Centre', lat: 53.7971, lng: -1.5384 },
  { key: 'leith', name: 'Leith Community Rooms', city: 'edinburgh', town: 'Leith', lat: 55.9755, lng: -3.1724 },
  { key: 'merchant', name: 'Merchant City Hall', city: 'glasgow', town: 'Merchant City', lat: 55.8592, lng: -4.2462 },
  { key: 'harbourside', name: 'Harbourside Studio', city: 'bristol', town: 'Harbourside', lat: 51.4497, lng: -2.5986 },
  { key: 'baltic', name: 'Baltic Rooms', city: 'liverpool', town: 'Baltic Triangle', lat: 53.3976, lng: -2.9836 },
  { key: 'bay-arts', name: 'Bay Arts Room', city: 'cardiff', town: 'Cardiff Bay', lat: 51.4639, lng: -3.1631 },
  { key: 'highfields', name: 'Highfields Hall', city: 'leicester', town: 'Highfields', lat: 52.6299, lng: -1.1185 },
]

export const events: SampleEvent[] = [
  {
    day: 0,
    time: '20:00',
    endTime: '23:30',
    city: 'london',
    venue: 'lale-hall',
    organiser: 'anadolu',
    category: 'concerts',
    spoken: 'tr',
    priceFrom: 18,
    priceTo: 25,
    featured: true,
    poster: 'rock',
    performers: [{ name: 'Grup Seyyah', kind: 'group' }],
    title: { tr: 'Anadolu Rock Gecesi', en: 'Anatolian Rock Night' },
    summary: {
      tr: 'Cem Karaca’dan Barış Manço’ya, Anadolu rock klasikleri canlı grupla sahnede.',
      en: 'Anatolian rock classics from Cem Karaca to Barış Manço, played live by a full band.',
    },
    description: {
      tr: 'Yetmişlerin Anadolu rock’ını Londra’ya taşıyoruz. Beş kişilik grup, iki set boyunca klasikleri yeni düzenlemelerle çalacak.\n\nKapılar 19:30’da açılır. Bar açıktır; mutfakta meze tabağı servis edilir.',
      en: 'We’re bringing seventies Anatolian rock to London. A five-piece band plays the classics in fresh arrangements across two sets.\n\nDoors open at 19:30. The bar is open and the kitchen serves meze plates.',
    },
  },
  {
    day: 0,
    time: '19:30',
    endTime: '21:30',
    city: 'manchester',
    venue: 'nq-loft',
    organiser: 'kahkaha',
    category: 'comedy',
    spoken: 'tr',
    age: '16',
    priceFrom: 15,
    performers: [{ name: 'Deniz Aksoy' }, { name: 'Mert Kılıç' }, { name: 'Elif Yalın' }],
    title: { tr: 'Stand-up: Gurbette Bir Gece', en: 'Stand-up: A Night Away From Home' },
    summary: {
      tr: 'Üç komedyen, İngiltere’de Türk olmanın en komik hallerini anlatıyor.',
      en: 'Three comedians on the funniest sides of being Turkish in Britain.',
    },
    description: {
      tr: 'Vize kuyrukları, İngiliz çayı, annelerin WhatsApp mesajları… Üç komedyen gurbet hayatını kendi gözünden anlatıyor.\n\nGösteri Türkçedir ve 16 yaş ve üzeri içindir.',
      en: 'Visa queues, builder’s tea, mums’ WhatsApp messages: three comedians take on life away from home.\n\nThe show is in Turkish and is for ages 16 and over.',
    },
  },
  {
    day: 1,
    time: '10:00',
    endTime: '14:00',
    city: 'london',
    venue: 'cinar',
    organiser: 'anadolu',
    category: 'food-drink',
    spoken: 'tr',
    priceFrom: 22,
    poster: 'kahvalti',
    title: { tr: 'Pazar Kahvaltısı ve Canlı Fasıl', en: 'Sunday Breakfast with Live Fasıl' },
    summary: {
      tr: 'Serpme kahvaltı, demlik çay ve öğlene kadar canlı fasıl müziği.',
      en: 'A spread breakfast, brewed tea and live fasıl music until lunchtime.',
    },
    description: {
      tr: 'Peynirler, zeytinler, sucuklu yumurta, simit ve sınırsız çay. Masalar uzun, sohbet bol.\n\nFasıl ekibi 11:00’de başlıyor. Çocuklar için ayrı fiyat organizatörden öğrenilebilir.',
      en: 'Cheeses, olives, eggs with sucuk, simit and bottomless tea, served at long shared tables.\n\nThe fasıl group starts at 11:00. Ask the organiser about children’s prices.',
    },
  },
  {
    day: 1,
    time: '11:00',
    endTime: '12:30',
    city: 'birmingham',
    venue: 'digbeth',
    organiser: 'lale',
    category: 'family',
    spoken: 'both',
    free: true,
    title: { tr: 'Çocuklar için Karagöz ve Hacivat', en: 'Karagöz and Hacivat Shadow Puppets for Kids' },
    summary: {
      tr: 'Geleneksel gölge oyunu, ardından çocukların kendi kuklalarını yaptığı atölye.',
      en: 'A traditional shadow play, then a workshop where children make their own puppets.',
    },
    description: {
      tr: 'Karagöz ile Hacivat’ın atışmaları Türkçe ve İngilizce sahneleniyor. Oyunun ardından çocuklar kartondan kendi kuklalarını yapıyor.\n\n4–10 yaş için uygundur. Yer sınırlı, erken gelin.',
      en: 'Karagöz and Hacivat’s famous back-and-forth, performed in Turkish and English. Afterwards children make their own cardboard puppets.\n\nBest for ages 4–10. Places are limited, so come early.',
    },
  },
  {
    day: 1,
    time: '15:00',
    endTime: '17:00',
    city: 'edinburgh',
    venue: 'leith',
    organiser: 'iskocya',
    category: 'community',
    spoken: 'both',
    free: true,
    title: { tr: 'Türk Kahvesi ve Sohbet', en: 'Turkish Coffee Afternoon' },
    summary: {
      tr: 'Edinburg’daki Türkler ve dostları için kahve, lokum ve sohbet.',
      en: 'Coffee, lokum and conversation for Turks in Edinburgh and their friends.',
    },
    description: {
      tr: 'Ayda bir yaptığımız buluşma. Yeni gelenler, öğrenciler ve aileler herkes davetli. Kahve falına bakan da var.\n\nGiriş ücretsizdir.',
      en: 'Our monthly get-together. New arrivals, students and families are all welcome, and someone always reads coffee cups.\n\nFree entry.',
    },
  },
  {
    fixedDate: { month: 10, day: 29 },
    time: '19:00',
    endTime: '23:00',
    city: 'london',
    venue: 'kervan',
    organiser: 'kuzey',
    category: 'community',
    spoken: 'tr',
    priceFrom: 10,
    featured: true,
    title: { tr: '29 Ekim Cumhuriyet Bayramı Kutlaması', en: 'Republic Day Celebration, 29 October' },
    summary: {
      tr: 'Cumhuriyet’in yıl dönümünü müzik, halk dansları ve yemekle kutluyoruz.',
      en: 'Marking the anniversary of the Turkish Republic with music, folk dance and food.',
    },
    description: {
      tr: 'Saygı duruşu ve İstiklal Marşı ile başlayan gecede çocuk korosu, halk dansları gösterisi ve canlı müzik var.\n\nBilet fiyatına akşam yemeği dahildir.',
      en: 'The evening opens with a minute’s silence and the national anthem, followed by a children’s choir, folk dancing and live music.\n\nDinner is included in the ticket.',
    },
  },
  {
    day: 6,
    time: '21:00',
    endTime: '03:00',
    city: 'london',
    venue: 'bogazici',
    organiser: 'bosphorus',
    category: 'nightlife',
    spoken: 'none',
    age: '18',
    priceFrom: 15,
    poster: 'pop',
    title: { tr: 'Türkçe Pop Gecesi', en: 'Turkish Pop Night' },
    summary: {
      tr: 'Doksanlardan bugüne Türkçe pop, sabaha kadar dans.',
      en: 'Turkish pop from the nineties to now, dancing until late.',
    },
    description: {
      tr: 'Tarkan’dan Sezen Aksu’ya, Mabel Matiz’den Hadise’ye. İki DJ, iki salon, tek kural: dans.\n\n18 yaş ve üzeri. Kimlik sorulur.',
      en: 'From Tarkan to Sezen Aksu, Mabel Matiz to Hadise. Two DJs, two rooms, one rule: dance.\n\n18 and over. Bring ID.',
    },
  },
  {
    day: 7,
    time: '20:00',
    endTime: '22:30',
    city: 'glasgow',
    venue: 'merchant',
    organiser: 'iskocya',
    category: 'concerts',
    spoken: 'tr',
    priceFrom: 12,
    title: { tr: 'Bağlama ve Türküler', en: 'Bağlama and Folk Songs' },
    summary: {
      tr: 'Bağlama ve kavalla Anadolu’nun dört bir yanından türküler.',
      en: 'Folk songs from across Anatolia on bağlama and kaval.',
    },
    description: {
      tr: 'Karadeniz’den Ege’ye, Doğu Anadolu’dan Rumeli’ye bir türkü yolculuğu. Her şarkıdan önce kısa bir hikaye.\n\nSalon küçük, biletler sınırlı.',
      en: 'A journey through folk songs from the Black Sea to the Aegean, eastern Anatolia to the Balkans, with a short story before each song.\n\nIt’s a small room, so tickets are limited.',
    },
  },
  {
    day: 7,
    time: '19:00',
    endTime: '22:00',
    city: 'leeds',
    venue: 'kirkgate',
    organiser: 'kuzey',
    category: 'community',
    spoken: 'tr',
    priceFrom: 8,
    title: { tr: 'Kuzey Türk Derneği Kültür Gecesi', en: 'Northern Turkish Association Culture Night' },
    summary: {
      tr: 'Ev yemekleri, şiir dinletisi ve çocuk gösterileriyle aile gecesi.',
      en: 'A family evening with home cooking, poetry readings and children’s performances.',
    },
    description: {
      tr: 'Derneğimizin mevsim gecesi. Her aile bir yemek getiriyor; çocuklar hazırladıkları gösterileri sunuyor.\n\nGelir derneğin Türkçe okuluna gider.',
      en: 'Our seasonal evening. Every family brings a dish and the children perform what they’ve prepared.\n\nMoney raised goes to the association’s Turkish school.',
    },
  },
  {
    day: 8,
    time: '18:00',
    endTime: '20:30',
    city: 'london',
    venue: 'cinar',
    organiser: 'anadolu',
    category: 'film',
    spoken: 'both',
    priceFrom: 8,
    title: { tr: 'Türk Sineması: Kısa Film Gösterimi', en: 'Turkish Cinema: Short Film Screening' },
    summary: {
      tr: 'Genç Türk yönetmenlerden altı kısa film, ardından söyleşi.',
      en: 'Six short films by young Turkish directors, followed by a Q&A.',
    },
    description: {
      tr: 'Filmler İngilizce altyazılıdır. Gösterimin ardından iki yönetmenle söyleşi yapılacak.',
      en: 'All films have English subtitles. Two of the directors join a Q&A after the screening.',
    },
  },
  {
    day: 8,
    time: '13:00',
    endTime: '16:00',
    city: 'bristol',
    venue: 'harbourside',
    organiser: 'lale',
    category: 'talks-workshops',
    spoken: 'en',
    priceFrom: 30,
    poster: 'ebru',
    title: { tr: 'Ebru Atölyesi', en: 'Ebru Paper Marbling Workshop' },
    summary: {
      tr: 'Geleneksel ebru sanatına giriş; kendi eserini alıp eve götür.',
      en: 'An introduction to traditional Turkish paper marbling. Take your own piece home.',
    },
    description: {
      tr: 'Boyaların hazırlanmasından ilk lale motifine kadar adım adım. Tüm malzemeler dahildir.\n\nAtölye İngilizcedir, sorular Türkçe de sorulabilir.',
      en: 'Step by step, from preparing the paints to your first tulip motif. All materials are included.\n\nThe workshop is in English; questions in Turkish are welcome too.',
    },
  },
  {
    day: 10,
    time: '19:00',
    endTime: '21:30',
    city: 'manchester',
    venue: 'nq-loft',
    organiser: 'girisim',
    category: 'business',
    spoken: 'both',
    free: true,
    title: { tr: 'Türk Girişimciler Buluşması', en: 'Turkish Entrepreneurs Meetup' },
    summary: {
      tr: 'Kurucular, yatırımcılar ve meraklılar için tanışma akşamı.',
      en: 'An evening for founders, investors and the curious to meet.',
    },
    description: {
      tr: 'Kısa sunumlar, ardından serbest tanışma. Bu ayın konusu: İngiltere’de şirket kurmanın ilk yılı.\n\nÜcretsizdir ama kayıt gerekir.',
      en: 'Short talks, then open networking. This month: the first year of running a company in the UK.\n\nFree, but registration is required.',
    },
  },
  {
    day: 9,
    time: '19:00',
    endTime: '20:30',
    city: 'london',
    venue: 'kervan',
    organiser: 'anadolu',
    category: 'concerts',
    spoken: 'none',
    priceFrom: 14,
    status: 'cancelled',
    title: { tr: 'Ney Dinletisi', en: 'Ney Flute Recital' },
    summary: {
      tr: 'Ney ve kudüm eşliğinde klasik Türk müziği dinletisi.',
      en: 'A recital of classical Turkish music on ney and kudüm.',
    },
    description: {
      tr: 'Sanatçının rahatsızlığı nedeniyle dinleti iptal edildi. Bilet ücretleri iade ediliyor.',
      en: 'The recital has been cancelled because the performer is unwell. Tickets are being refunded.',
    },
  },
  {
    day: 11,
    time: '20:00',
    endTime: '22:00',
    city: 'london',
    venue: 'lale-hall',
    organiser: 'kuzey',
    category: 'concerts',
    spoken: 'tr',
    priceFrom: 12,
    title: { tr: 'Türk Halk Müziği Korosu Konseri' },
    summary: { tr: 'Kırk kişilik koro, sevilen türküleri çok sesli düzenlemelerle seslendiriyor.' },
    description: {
      tr: 'Koromuzun sezon konseri. Repertuvarda Neşet Ertaş, Aşık Veysel ve Karadeniz türküleri var.\n\nKonser yaklaşık iki saat sürer, arada kısa bir ara verilir.',
    },
  },
  {
    day: 12,
    time: '20:00',
    endTime: '22:00',
    city: 'london',
    venue: 'ada',
    organiser: 'kuzey',
    category: 'sport',
    spoken: 'tr',
    free: true,
    title: { tr: 'Derbi Maç Yayını', en: 'Big Derby Screening' },
    summary: {
      tr: 'Dev ekranda derbi heyecanı, çay ocağı ve tost.',
      en: 'The derby on the big screen, with a tea stand and toasties.',
    },
    description: {
      tr: 'Her iki takımın taraftarı da davetli. Saygı çerçevesinde tezahürat serbest.\n\nGiriş ücretsiz, masalar ilk gelen ilk oturur.',
      en: 'Fans of both teams welcome. Cheer as loud as you like, respectfully.\n\nFree entry; tables are first come, first served.',
    },
  },
  {
    day: 13,
    time: '20:00',
    endTime: '01:00',
    city: 'liverpool',
    venue: 'baltic',
    organiser: 'bosphorus',
    category: 'nightlife',
    spoken: 'none',
    age: '18',
    priceFrom: 10,
    title: { tr: 'Halay Gecesi', en: 'Halay Dance Night' },
    summary: {
      tr: 'Davul zurna ile başlayan, DJ ile süren uzun bir halay gecesi.',
      en: 'A long night of halay: it starts with davul and zurna, then the DJ takes over.',
    },
    description: {
      tr: 'İlk saatte canlı davul zurna, sonrasında halay ve horon karışık DJ seti. Halay bilmeyenlere ilk yarım saatte kısa ders.\n\n18 yaş ve üzeri.',
      en: 'Live davul and zurna for the first hour, then a DJ mixing halay and horon. A short lesson in the first half hour for beginners.\n\n18 and over.',
    },
  },
  {
    day: 14,
    span: 1,
    time: '12:00',
    endTime: '20:00',
    city: 'london',
    venue: 'kervan',
    organiser: 'anadolu',
    category: 'festivals',
    spoken: 'both',
    free: true,
    featured: true,
    poster: 'festival',
    title: { tr: 'Türk Sokak Lezzetleri Festivali', en: 'Turkish Street Food Festival' },
    summary: {
      tr: 'İki gün boyunca lahmacun, gözleme, midye ve künefe; canlı müzik ve çocuk alanı.',
      en: 'Two days of lahmacun, gözleme, stuffed mussels and künefe, with live music and a kids’ area.',
    },
    description: {
      tr: 'Yirmiden fazla tezgah, her gün iki konser ve çocuklar için ebru köşesi. Giriş ücretsiz, yiyecekler tezgahlardan alınır.\n\nYağmur yağarsa etkinlik kapalı salonda devam eder.',
      en: 'Over twenty stalls, two concerts a day and a marbling corner for children. Entry is free; food is bought from the stalls.\n\nIf it rains, the festival moves indoors.',
    },
  },
  {
    day: 14,
    time: '19:30',
    endTime: '21:30',
    city: 'cardiff',
    venue: 'bay-arts',
    organiser: 'lale',
    category: 'theatre',
    spoken: 'tr',
    priceFrom: 12,
    title: { tr: 'Tiyatro: Kapıdaki Mektup', en: 'Theatre: The Letter at the Door' },
    summary: {
      tr: 'Galler’de yaşayan bir Türk ailesinin bir mektupla değişen hayatı.',
      en: 'A Turkish family in Wales, and the letter that changes everything.',
    },
    description: {
      tr: 'Amatör topluluğumuzun yeni oyunu. İki perde, ara ile yaklaşık iki saat.\n\nOyun Türkçedir; İngilizce özet broşürde yer alır.',
      en: 'The new play from our amateur company. Two acts, about two hours with an interval.\n\nPerformed in Turkish, with an English synopsis in the programme.',
    },
  },
  {
    day: 15,
    time: '13:00',
    endTime: '17:00',
    city: 'leicester',
    venue: 'highfields',
    organiser: 'kuzey',
    category: 'family',
    spoken: 'both',
    free: true,
    title: { tr: 'Aile Günü: Oyunlar ve Gözleme', en: 'Family Day: Games and Gözleme' },
    summary: {
      tr: 'Çuval yarışı, mendil kapmaca ve sıcak gözleme ile aile günü.',
      en: 'Sack races, traditional playground games and hot gözleme for the whole family.',
    },
    description: {
      tr: 'Çocukluğumuzun oyunlarını çocuklarımızla oynuyoruz. Gözleme ve ayran satışı yerinde yapılır.\n\nGiriş ücretsizdir.',
      en: 'The games we grew up with, played with our children. Gözleme and ayran are sold on the day.\n\nFree entry.',
    },
  },
  {
    day: 17,
    time: '19:00',
    endTime: '21:00',
    city: 'london',
    venue: 'cinar',
    organiser: 'lale',
    category: 'talks-workshops',
    spoken: 'both',
    free: true,
    title: { tr: 'Söyleşi: Londra’ya Göçün Hikayeleri', en: 'Talk: Stories of Migration to London' },
    summary: {
      tr: 'Altmışlardan bugüne Londra’ya gelen Türklerin hikayeleri, ilk ağızdan.',
      en: 'Turkish Londoners who arrived from the sixties onwards tell their stories.',
    },
    description: {
      tr: 'Dört konuşmacı, dört farklı on yıl. Fabrikalardan dükkanlara, okullardan ofislere uzanan hikayeler.\n\nSöyleşi Türkçe ve İngilizce yapılır.',
      en: 'Four speakers from four different decades, with stories that run from factories and shops to schools and offices.\n\nThe talk is in Turkish and English.',
    },
  },
  {
    day: 20,
    time: '20:30',
    endTime: '23:30',
    city: 'birmingham',
    venue: 'digbeth',
    organiser: 'bosphorus',
    category: 'concerts',
    spoken: 'tr',
    age: '18',
    priceFrom: 20,
    performers: [{ name: 'Orkestra Hüzün', kind: 'group' }],
    title: { tr: 'Arabesk Gecesi', en: 'Arabesk Night' },
    summary: {
      tr: 'Arabeskin unutulmaz şarkıları canlı orkestrayla.',
      en: 'Unforgettable arabesk songs with a live orchestra.',
    },
    description: {
      tr: 'Yaylı grubuyla kalabalık bir orkestra, iki solist ve bol duygu.\n\n18 yaş ve üzeri. Masalar önceden rezerve edilir.',
      en: 'A big orchestra with a string section, two singers and plenty of feeling.\n\n18 and over. Tables are reserved in advance.',
    },
  },
  {
    day: 21,
    time: '19:30',
    endTime: '21:30',
    city: 'london',
    venue: 'bogazici',
    organiser: 'kahkaha',
    category: 'comedy',
    spoken: 'tr',
    age: '16',
    priceFrom: 7,
    title: { tr: 'Kahkaha Kulübü: Açık Mikrofon', en: 'Comedy Club: Open Mic' },
    summary: {
      tr: 'Sahneye ilk kez çıkanlar ve deneyimliler, beşer dakika.',
      en: 'First-timers and regulars, five minutes each.',
    },
    description: {
      tr: 'Sahneye çıkmak isteyenler organizatöre yazabilir. Seyirciler için harika bir keşif gecesi.',
      en: 'If you’d like a slot, message the organiser. For the audience, it’s a great night of discoveries.',
    },
  },
  {
    day: 22,
    time: '11:00',
    endTime: '12:00',
    city: 'edinburgh',
    venue: 'leith',
    organiser: 'iskocya',
    category: 'family',
    spoken: 'tr',
    free: true,
    title: { tr: 'Çocuklar için Türkçe Masal Saati', en: 'Turkish Storytime for Children' },
    summary: {
      tr: 'Nasreddin Hoca ve Keloğlan masalları, ardından boyama.',
      en: 'Tales of Nasreddin Hodja and Keloğlan, then colouring.',
    },
    description: {
      tr: 'Türkçe öğrenen çocuklar için masal saati. 3–8 yaş için uygundur, ebeveynler de davetlidir.',
      en: 'Storytime for children learning Turkish. Best for ages 3–8; parents are welcome too.',
    },
  },
  {
    day: 24,
    time: '19:00',
    endTime: '22:30',
    city: 'london',
    venue: 'lale-hall',
    organiser: 'anadolu',
    category: 'concerts',
    spoken: 'tr',
    priceFrom: 35,
    title: { tr: 'Fasıl Akşamı', en: 'An Evening of Fasıl' },
    summary: {
      tr: 'Klasik fasıl repertuvarı, meze sofrası eşliğinde.',
      en: 'The classic fasıl repertoire, with a table of meze.',
    },
    description: {
      tr: 'Ud, kanun, keman ve darbukadan oluşan fasıl heyeti eşliğinde uzun bir akşam yemeği.\n\nBilete meze tabağı ve ana yemek dahildir.',
      en: 'A long dinner with a fasıl ensemble of oud, kanun, violin and darbuka.\n\nMeze and a main course are included in the ticket.',
    },
  },
  {
    day: 28,
    time: '18:00',
    endTime: '22:00',
    city: 'glasgow',
    venue: 'merchant',
    organiser: 'iskocya',
    category: 'community',
    spoken: 'both',
    priceFrom: 25,
    title: { tr: 'Yıl Sonu Topluluk Yemeği', en: 'Year-End Community Dinner' },
    summary: {
      tr: 'Glasgow’daki Türk topluluğuyla yılı birlikte uğurluyoruz.',
      en: 'Seeing out the year with Glasgow’s Turkish community.',
    },
    description: {
      tr: 'Dört çeşit yemek, tombala ve müzik. Çocuklar için indirimli bilet vardır.',
      en: 'A four-course dinner, tombala and music. Discounted tickets for children.',
    },
  },
  {
    day: 30,
    time: '20:00',
    endTime: '22:00',
    city: 'london',
    venue: 'kervan',
    organiser: 'lale',
    category: 'arts-culture',
    spoken: 'none',
    priceFrom: 20,
    poster: 'sema',
    title: { tr: 'Tasavvuf Müziği ve Sema', en: 'Sufi Music and Sema' },
    summary: {
      tr: 'Ney, kudüm ve tanbur eşliğinde sema gösterisi.',
      en: 'A sema performance with ney, kudüm and tanbur.',
    },
    description: {
      tr: 'Mevlevi geleneğinden eserler ve sema. Gösteri boyunca fotoğraf çekilmemesi rica olunur.',
      en: 'Works from the Mevlevi tradition and a sema ceremony. Please don’t take photos during the performance.',
    },
  },
  {
    day: 35,
    time: '19:00',
    endTime: '21:30',
    city: 'leeds',
    venue: 'kirkgate',
    organiser: 'kuzey',
    category: 'film',
    spoken: 'tr',
    priceFrom: 6,
    title: { tr: 'Türk Filmleri Gecesi: Yeşilçam Klasikleri', en: 'Turkish Film Night: Yeşilçam Classics' },
    summary: {
      tr: 'Yeşilçam’ın sevilen bir komedisi, çay ve simit eşliğinde.',
      en: 'A much-loved Yeşilçam comedy, with tea and simit.',
    },
    description: {
      tr: 'Film İngilizce altyazılıdır. Gösterimden önce kısa bir Yeşilçam sunumu yapılacak.',
      en: 'The film has English subtitles. There’s a short introduction to Yeşilçam before the screening.',
    },
  },
  {
    day: 40,
    time: '10:00',
    endTime: '17:00',
    city: 'london',
    venue: 'ada',
    organiser: 'lale',
    category: 'arts-culture',
    spoken: 'both',
    free: true,
    title: { tr: 'Türk El Sanatları Pazarı', en: 'Turkish Crafts Market' },
    summary: {
      tr: 'Çini, kilim, bakır ve takı: Londra’daki Türk zanaatkarlardan.',
      en: 'Tiles, kilims, copperware and jewellery from Turkish makers in London.',
    },
    description: {
      tr: 'Otuz zanaatkar, canlı çini boyama gösterisi ve hediye paketleme köşesi.\n\nGiriş ücretsizdir.',
      en: 'Thirty makers, a live tile-painting demonstration and a gift-wrapping corner.\n\nFree entry.',
    },
  },
  {
    day: 45,
    time: '21:00',
    endTime: '03:00',
    city: 'london',
    venue: 'bogazici',
    organiser: 'bosphorus',
    category: 'nightlife',
    spoken: 'none',
    age: '18',
    priceFrom: 25,
    soldOut: true,
    title: { tr: 'Yılbaşı Öncesi Türk Partisi', en: 'Pre-New Year Turkish Party' },
    summary: {
      tr: 'Yılın son büyük Türkçe partisi. Biletler tükendi.',
      en: 'The last big Turkish party of the year. Sold out.',
    },
    description: {
      tr: 'Üç DJ, canlı perküsyon ve gece yarısı sürprizi. Biletler tükendi; bekleme listesi için organizatöre yazın.',
      en: 'Three DJs, live percussion and a midnight surprise. Sold out; message the organiser to join the waiting list.',
    },
  },
  {
    day: 50,
    time: '19:00',
    endTime: '20:30',
    city: 'bristol',
    venue: 'harbourside',
    organiser: 'lale',
    category: 'talks-workshops',
    spoken: 'both',
    free: true,
    title: { tr: 'Türkçe Konuşma Kulübü', en: 'Turkish Conversation Club' },
    summary: {
      tr: 'Türkçe öğrenenler ve anadili Türkçe olanlar için sohbet akşamı.',
      en: 'A conversation evening for Turkish learners and native speakers.',
    },
    description: {
      tr: 'Her seviyeden katılımcıya açık. Masalar seviyelere göre ayrılır.',
      en: 'Open to every level. Tables are grouped by level.',
    },
  },
  {
    fixedDate: { month: 2, day: 20 },
    time: '17:30',
    endTime: '21:00',
    city: 'london',
    venue: 'lale-hall',
    organiser: 'kuzey',
    category: 'ramadan-eid',
    spoken: 'both',
    free: true,
    title: { tr: 'Topluluk İftarı', en: 'Community Iftar' },
    summary: {
      tr: 'Ramazan’da herkese açık iftar sofrası. Komşularınızı da getirin.',
      en: 'An open iftar table during Ramadan. Bring your neighbours.',
    },
    description: {
      tr: 'Çorba, pilav, et yemeği ve tatlıdan oluşan iftar menüsü. Oruç tutan tutmayan herkes davetli.\n\nYer sınırlı olduğu için kayıt gerekir.',
      en: 'An iftar menu of soup, rice, a meat dish and dessert. Everyone is welcome, fasting or not.\n\nRegistration is required as places are limited.',
    },
  },
]
