package ma.lbledfirst.backend.seed;

import java.math.BigDecimal;
import java.util.List;

import lombok.RequiredArgsConstructor;
import ma.lbledfirst.backend.domain.Capsule;
import ma.lbledfirst.backend.domain.Chapter;
import ma.lbledfirst.backend.domain.Formation;
import ma.lbledfirst.backend.domain.FormationLanguage;
import ma.lbledfirst.backend.domain.FormationLevel;
import ma.lbledfirst.backend.domain.Instructor;
import ma.lbledfirst.backend.repository.FormationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
@RequiredArgsConstructor
public class FormationSeeder implements CommandLineRunner {

    private final FormationRepository formationRepository;

    @Override
    public void run(String... args) {
        if (formationRepository.count() > 0) return;

        formationRepository.save(tarzFassi());
        formationRepository.save(zellige());
        formationRepository.save(tapisBerbere());
        formationRepository.save(poterieSafi());
        formationRepository.save(calligraphieArabe());
        formationRepository.save(cuisineMarocaine());
        formationRepository.save(cuirDeFes());
        formationRepository.save(caftanMarocain());
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private Capsule capsule(int order, String title, int duration, String desc, String thumb, Chapter ch) {
        return Capsule.builder()
                .order(order).title(title).duration(duration)
                .description(desc).thumbnail(thumb).chapter(ch)
                .build();
    }

    private Instructor instructor(String name, String specialty, int years, String bio, String photo,
                                  int formations, double rating, int trained) {
        return Instructor.builder()
                .name(name).specialty(specialty).experienceYears(years)
                .bio(bio).photo(photo)
                .totalFormations(formations).averageRating(rating).studentsTrained(trained)
                .build();
    }

    // ── 1. Tarz Fassi ──────────────────────────────────────────────────────

    private Formation tarzFassi() {
        Formation f = Formation.builder()
                .slug("tarz-fassi")
                .title("Tarz Fassi — The Art of Fes Embroidery")
                .shortDescription("Master the stitches, patterns, and symbols of the famous Tarz Fassi passed down since the 14th century.")
                .longDescription("Tarz Fassi is one of the most prestigious crafts in the Medina of Fes. This course guides you step-by-step in mastering the Moroccan cross-stitch, geometric patterns inspired by Andalusian architecture, and the composition of a complete piece — tablecloth, cushion, or embroidered caftan.")
                .category("Embroidery").level(FormationLevel.intermediaire).language(FormationLanguage.anglais)
                .price(new BigDecimal("890"))
                .coverImage("https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(342)
                .objectives(List.of("Understand the history and symbols of Tarz Fassi","Master the 5 basic stitches of Fassi embroidery","Create a complete and harmonious composition","Choose traditional threads, fabrics, and colors"))
                .skills(List.of("Fundamental stitches of Tarz Fassi","Reading and creating geometric patterns","Matching traditional colors","Professional finishes"))
                .prerequisites(List.of("Basic hand sewing skills","Patience and precision"))
                .instructor(instructor("Lalla Fatima Zahra Bennani","Maalema — Tarz Fassi",32,"Heir to a lineage of embroiderers from the Medina of Fes, she has been transmitting the art of Tarz Fassi for three decades.","https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",3,4.9,1240))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction & History").formation(f).build();
        ch1.setCapsules(List.of(
                capsule(1,"Welcome and course overview",8,"Discover the journey and materials.","https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80",ch1),
                capsule(2,"History of Tarz Fassi",14,"From Andalusian palaces to the Medina of Fes.","https://images.unsplash.com/photo-1553913861-c0fddf2619ee?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials & Tools").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(3,"Choosing your fabric and threads",18,"Canvas, Egyptian cotton, and natural silk.","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(4,"Preparing the hoop and needle",12,"Perfect tension for an even stitch.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("The 5 Fundamental Stitches").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(5,"The Moroccan cross-stitch",22,"The foundation of all compositions.","https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(6,"The stem stitch",16,"Clean outlines and fluid curves.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(7,"Flat filling",20,"Colorful solids and even surfaces.","https://images.unsplash.com/photo-1591129841117-3adfd313e34f?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Guided Demonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(8,"Creating a full star pattern",32,"Follow the maalema step by step.","https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(9,"Composing a border",28,"Assembling multiple patterns.","https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(
                capsule(10,"Designing your personal piece",24,"Sketch, palette, and embroidery plan.","https://images.unsplash.com/photo-1610030006870-cbc4d1cca3c6?auto=format&fit=crop&w=600&q=80",ch5),
                capsule(11,"Finishes and presentation",20,"Ironing, lining, framing.","https://images.unsplash.com/photo-1594736797933-d0a501ba2fe6?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 2. Zellige ─────────────────────────────────────────────────────────

    private Formation zellige() {
        Formation f = Formation.builder()
                .slug("zellige-de-fes")
                .title("Zellige of Fes — Traditional Mosaic")
                .shortDescription("Learn to cut, lay, and compose zellige mosaics that adorn riads.")
                .longDescription("Zellige is the geometric soul of Moroccan architecture. This course covers cutting tesserae, reading classic patterns (khatem, safifa, zouwaqa), and composing a complete panel.")
                .category("Zellige").level(FormationLevel.avance).language(FormationLanguage.anglais)
                .price(new BigDecimal("1290"))
                .coverImage("https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(218)
                .objectives(List.of("Recognize classic zellige patterns","Hand-cut tesserae","Compose a complete panel","Lay zellige on a support"))
                .skills(List.of("Manual cutting","Pattern reading","Laying and grouting"))
                .prerequisites(List.of("None — open to motivated beginners"))
                .instructor(instructor("Maalem Hicham El Fassi","Master Zellige Maker",25,"Master zellige maker from the Medina of Fes, trained in the traditional school since the age of 12.","https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",2,4.8,860))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction to zellige").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"History and symbolism",12,"From the Marinids to today.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials and tools").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Clay, enamels, and menqach",20,"The master's tools.","https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Cutting the tesserae").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"The master's gesture",30,"Precision and rhythm.","https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Basic shapes — square, triangle, diamond",24,"Fundamental repertoire.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Composing a panel").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"8-pointed star pattern",36,"The khatem sulaimani.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Friezes and borders",22,"Assembling a cohesive set.","https://images.unsplash.com/photo-1615529162924-f8605388461d?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Creating a zellige coffee table",40,"From sketch to installation.","https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 3. Berber Carpet ───────────────────────────────────────────────────

    private Formation tapisBerbere() {
        Formation f = Formation.builder()
                .slug("tapis-berbere")
                .title("Weaving the Beni Ourain Berber Carpet")
                .shortDescription("Weave your first Berber carpet with symbolic patterns of the Middle Atlas.")
                .longDescription("Every Berber carpet tells a story. Learn how to set up your loom, prepare the wool, and weave an authentic Beni Ourain with ancestral patterns.")
                .category("Weaving").level(FormationLevel.intermediaire).language(FormationLanguage.anglais)
                .price(new BigDecimal("780"))
                .coverImage("https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(275)
                .objectives(List.of("Set up a vertical loom","Spin and naturally dye wool","Weave an authentic Berber pattern"))
                .skills(List.of("Spinning","Vegetable dyeing","Knot weaving"))
                .prerequisites(List.of("No prerequisites"))
                .instructor(instructor("Aïcha Ait Ouyahia","Berber Carpet Weaver",28,"Member of a women's cooperative in the Middle Atlas, Aïcha masters the Beni Ourain and Boucherouite patterns.","https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80",2,4.9,920))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"The universe of the Berber carpet",14,"Beni Ourain, Boucherouite, Azilal.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(2,"Choosing your wool",16,"Sheep's wool from the Middle Atlas.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(3,"Vegetable dyeing",22,"Henna, saffron, indigo.","https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("The Loom").formation(f).build();
        ch3.setCapsules(List.of(capsule(4,"Setting up the vertical loom",28,"Structure, tension, and warp.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Weaving").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"Berber knot and single row",32,"The fundamental gesture.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Patterns and symbols",26,"Diamonds, chevrons, and stars.","https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Your first carpet (60×90 cm)",42,"From project to finishing.","https://images.unsplash.com/photo-1600298881974-6be191ceeda1?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 4. Poterie de Safi ─────────────────────────────────────────────────

    private Formation poterieSafi() {
        Formation f = Formation.builder()
                .slug("poterie-de-safi")
                .title("Enamelled Pottery of Safi")
                .shortDescription("From raw clay to an enamelled piece: master the gestures of the Safi potter.")
                .longDescription("Safi is the Moroccan capital of enamelled pottery. This course introduces you to throwing, firing, and the famous polychrome enamels of the potters' hill.")
                .category("Pottery").level(FormationLevel.debutant).language(FormationLanguage.anglais)
                .price(new BigDecimal("690"))
                .coverImage("https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(189)
                .objectives(List.of("Prepare and center the clay","Throw a vase and a dish","Enamel with the colors of Safi"))
                .skills(List.of("Throwing","Enameling","Firing"))
                .prerequisites(List.of("No prerequisites"))
                .instructor(instructor("Maalem Brahim Tazi","Potter of Safi",30,"Potter from the potters' hill in Safi, specialist in traditional Moroccan polychrome enamels.","https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&q=80",2,4.7,610))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"Welcome to the potters' hill",10,"Discovering Safi.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"The red clay of Safi",14,"Extraction and preparation.","https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Potter's tools").formation(f).build();
        ch3.setCapsules(List.of(capsule(3,"The wheel, trimming tools, sponges",12,"Overview.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Demonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(4,"Centering and raising a bowl",28,"The first gesture.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(5,"Enameling with Safi colors",24,"Blue, yellow, green.","https://images.unsplash.com/photo-1567538096631-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"A traditional Safi dish",36,"From throwing to firing.","https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 5. Calligraphie arabe ──────────────────────────────────────────────

    private Formation calligraphieArabe() {
        Formation f = Formation.builder()
                .slug("calligraphie-arabe")
                .title("Arabic Calligraphy — Maghrebi Style")
                .shortDescription("Discover the Maghrebi calligraphy style, unique for its round curves and rhythm.")
                .longDescription("Maghrebi calligraphy is one of the eight major styles of Arabic calligraphy. This course takes you from preparing the reeds (qalam) to composing your own artworks.")
                .category("Calligraphy").level(FormationLevel.debutant).language(FormationLanguage.anglais)
                .price(new BigDecimal("590"))
                .coverImage("https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(512)
                .objectives(List.of("Cut and prepare the qalam","Trace Maghrebi style letters","Compose a calligraphic artwork"))
                .skills(List.of("Cutting the qalam","Letter ductus","Composition"))
                .prerequisites(List.of("None — perfect for beginners"))
                .instructor(instructor("Youssef Skalli","Master Calligrapher",22,"Graduate calligrapher from the Arabic Calligraphy Academy of Istanbul. He teaches the Maghrebi, Thuluth, and Diwani styles.","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",4,4.9,1580))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"History of Arabic calligraphy",15,"From the eight styles to Maghrebi.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Paper, ink, and qalam",18,"The calligrapher's trio.","https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Isolated letters").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"The 6 basic letters",26,"Alif, Ba', Ra'...","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Looped letters",22,"Waw, Nun, Ya'.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Demonstration").formation(f).build();
        ch4.setCapsules(List.of(capsule(5,"Letter connection and rhythm",24,"Fluidity and pace.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"Compose your own calligram",30,"From idea to the board.","https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 6. Moroccan Cuisine ───────────────────────────────────────────────

    private Formation cuisineMarocaine() {
        Formation f = Formation.builder()
                .slug("cuisine-marocaine")
                .title("Traditional Moroccan Cuisine — The Classics")
                .shortDescription("Tagine, couscous, pastilla, harira, msemen: master the great recipes that make Morocco famous.")
                .longDescription("This course plunges you into the heart of authentic Moroccan cuisine, the kind that is passed from mother to daughter in the kitchens of Fes, Chefchaouen, and Marrakech. In 15 video capsules filmed in a real kitchen, Chef Nadia Bouchentouf shares her techniques, precise measurements, and tips for 100% homemade cooking.")
                .category("Cuisine").level(FormationLevel.debutant).language(FormationLanguage.anglais)
                .price(new BigDecimal("490"))
                .coverImage("https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=1600&q=80")
                .studentsCount(987)
                .objectives(List.of("Identify, measure, and combine essential spices","Make a tender tagine","Roll and steam Friday's couscous","Make a crispy pastilla","Prepare classic Moroccan breads","Compose a full Moroccan menu"))
                .skills(List.of("Mastering spices and homemade ras el hanout","Slow cooking techniques in a tagine","Rolling and steaming couscous","Layering and folding pastilla","Moroccan pastry","Traditional plating"))
                .prerequisites(List.of("No prerequisites — open to all levels"))
                .instructor(instructor("Chef Nadia Bouchentouf","Traditional Moroccan Cuisine",18,"Former chef of a starred riad in Marrakech, Nadia shares her grandmother's recipes from Chefchaouen.","https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",5,4.8,2340))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction & culinary culture").formation(f).build();
        ch1.setCapsules(List.of(
                capsule(1,"Welcome to Chef Nadia's kitchen",8,"Discovering the journey and materials.","https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80",ch1),
                capsule(2,"History of Moroccan cuisine",14,"Berber, Andalusian, Arab, and Jewish influences.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Spices & the pantry").formation(f).build();
        ch2.setCapsules(List.of(
                capsule(3,"Tour of the 12 essential spices",22,"Cumin, ginger, turmeric, saffron, cinnamon.","https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(4,"Make your own ras el hanout",18,"The recipe with 27 balanced spices.","https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",ch2),
                capsule(5,"Fresh herbs and condiments",14,"Coriander, flat-leaf parsley, olives, preserved lemons.","https://images.unsplash.com/photo-1615485500704-8e990f9900e3?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Traditional tools").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(6,"The tagine: selection, seasoning, maintenance",16,"Salé clay, cast iron, or enamelled.","https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(7,"The couscoussier and the gsaa",12,"Utensils for Friday's couscous.","https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Demonstrations of great recipes").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(8,"Chicken tagine - preserved lemon - olives",32,"The star recipe.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(9,"Kefta and egg tagine",24,"Quick and tasty variation.","https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(10,"Friday's 7-vegetable couscous",38,"Traditional rolling of semolina.","https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(11,"Chicken pastilla with almonds",34,"The sweet and savory of Al-Andalus.","https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(12,"Harira — the Ramadan soup",22,"The creamy soup with legumes.","https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(13,"Msemen & mint tea",26,"The flaky breakfast bread.","https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final project — entertaining Moroccan style").formation(f).build();
        ch5.setCapsules(List.of(
                capsule(14,"Compose a complete 3-course menu",28,"Appetizer, main course, dessert.","https://images.unsplash.com/photo-1541544181051-e46607bc22a4?auto=format&fit=crop&w=600&q=80",ch5),
                capsule(15,"Plating & Moroccan tableware",22,"From embroidered tablecloth to tea service.","https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 7. Leather of Fes ─────────────────────────────────────────────────────

    private Formation cuirDeFes() {
        Formation f = Formation.builder()
                .slug("cuir-de-fes")
                .title("Leather of Fes — Traditional Leather Craft")
                .shortDescription("From vegetable tanning to hand sewing, learn the craftsmanship of the Chouara tanneries.")
                .longDescription("Discover the secrets of Fes leather: natural tanning, dyeing with plant pigments, and linen thread sewing.")
                .category("Leather").level(FormationLevel.intermediaire).language(FormationLanguage.anglais)
                .price(new BigDecimal("850"))
                .coverImage("https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(156)
                .objectives(List.of("Understand vegetable tanning","Naturally dye leather","Hand sew a leather good"))
                .skills(List.of("Tanning","Dyeing","Hand sewing"))
                .prerequisites(List.of("None"))
                .instructor(instructor("Maalem Omar Chaouni","Fes Leatherworker",27,"Artisan of the Chouara tanneries, he perpetuates traditional vegetable tanning and hand sewing of Moroccan leather.","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",2,4.7,540))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"The Chouara tanneries",14,"A living heritage.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Leathers and linen threads",18,"Selection and cutting.","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Tools").formation(f).build();
        ch3.setCapsules(List.of(capsule(3,"Awl, knife, rasp",12,"The master's workshop.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Demonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(4,"Dyeing with plant pigments",24,"Pomegranate, indigo, saffron.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(5,"Saddle stitching with linen thread",30,"Unalterable sewing.","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(6,"Make a Fes leather wallet",36,"From pattern to finished product.","https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }

    // ── 8. Moroccan Caftan ─────────────────────────────────────────────────

    private Formation caftanMarocain() {
        Formation f = Formation.builder()
                .slug("caftan-marocain")
                .title("Sewing the Modern Moroccan Caftan")
                .shortDescription("Create a custom caftan — pattern making, assembly, embroidery, and finishing.")
                .longDescription("The Moroccan caftan is one of the most beautiful garments in the world. This course accompanies you in the complete creation of a custom-made caftan.")
                .category("Sewing").level(FormationLevel.avance).language(FormationLanguage.anglais)
                .price(new BigDecimal("1490"))
                .coverImage("https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=1200&q=80")
                .studentsCount(143)
                .objectives(List.of("Take measurements for a custom caftan","Draw and cut the pattern","Assemble and embroider the caftan","Add sfifa and akaad"))
                .skills(List.of("Pattern making","Assembly","Sfifa","Hand embroidery"))
                .prerequisites(List.of("Basic machine and hand sewing"))
                .instructor(instructor("Saida El Alaoui","Caftan Seamstress",24,"Stylist-seamstress based in Rabat, Saida has dressed several stars for Caftan Week.","https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",3,4.9,1120))
                .build();

        Chapter ch1 = Chapter.builder().order(1).title("Introduction").formation(f).build();
        ch1.setCapsules(List.of(capsule(1,"The universe of the caftan",12,"From the Takchita to the modern caftan.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch1)));
        Chapter ch2 = Chapter.builder().order(2).title("Materials").formation(f).build();
        ch2.setCapsules(List.of(capsule(2,"Fabrics, linings, and akaad",20,"Premium selection.","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80",ch2)));
        Chapter ch3 = Chapter.builder().order(3).title("Pattern making").formation(f).build();
        ch3.setCapsules(List.of(
                capsule(3,"Taking measurements",18,"Precision and comfort.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch3),
                capsule(4,"Drawing the pattern",26,"Bust, sleeves, skirt.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch3)));
        Chapter ch4 = Chapter.builder().order(4).title("Demonstration").formation(f).build();
        ch4.setCapsules(List.of(
                capsule(5,"Assembling the caftan",40,"Step-by-step assembly.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch4),
                capsule(6,"Sfifa and akaad — finishes",30,"The identity of the caftan.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch4)));
        Chapter ch5 = Chapter.builder().order(5).title("Final Project").formation(f).build();
        ch5.setCapsules(List.of(capsule(7,"Your personal caftan",50,"From cut to runway.","https://images.unsplash.com/photo-1583912086096-8c60d75a53f9?auto=format&fit=crop&w=600&q=80",ch5)));
        f.setChapters(List.of(ch1,ch2,ch3,ch4,ch5));
        return f;
    }
}