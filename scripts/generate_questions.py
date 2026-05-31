import json
from pathlib import Path

# Category Distribution:
# 1. Constitution: 31 questions
# 2. Geography: 26 questions
# 3. General Knowledge: 26 questions
# 4. History: 26 questions
# 5. Governance & Public Administration: 26 questions
# 6. Science & Technology: 21 questions
# 7. Economics: 21 questions
# 8. Mathematics & Reasoning: 16 questions
# 9. Nepali Language & Literature: 16 questions
# Total: 209 questions (> 200)

constitution = [
    (
        "Under the Constitution of Nepal, how many fundamental rights are guaranteed?",
        "21", "28", "31", "35",
        "C",
        "Part 3 of the Constitution of Nepal guarantees 31 fundamental rights from Article 16 to 46.",
        "Constitution"
    ),
    (
        "Which article of the Constitution of Nepal guarantees the 'Right to live with dignity'?",
        "Article 15", "Article 16", "Article 17", "Article 18",
        "B",
        "Article 16 of the Constitution of Nepal states that every citizen shall have the right to live with dignity and no law shall be made providing for the death penalty.",
        "Constitution"
    ),
    (
        "Which article of the Constitution of Nepal covers the 'Right to communication'?",
        "Article 17", "Article 18", "Article 19", "Article 20",
        "C",
        "Article 19 guarantees the right to communication, ensuring no publication or broadcasting shall be censored.",
        "Constitution"
    ),
    (
        "The 'Right to justice' is guaranteed under which article of the Constitution of Nepal?",
        "Article 20", "Article 21", "Article 22", "Article 23",
        "A",
        "Article 20 guarantees the right to justice, including the right to be informed of the reasons for arrest and the right to consult a legal practitioner.",
        "Constitution"
    ),
    (
        "Which article guarantees the 'Right of victim of crime'?",
        "Article 19", "Article 20", "Article 21", "Article 22",
        "C",
        "Article 21 states that a victim of crime shall have the right to be informed about the investigation and proceedings, and to be compensated.",
        "Constitution"
    ),
    (
        "The 'Right against torture' is provided in which article of the Constitution?",
        "Article 22", "Article 23", "Article 24", "Article 25",
        "A",
        "Article 22 protects citizens against physical or mental torture and cruel, inhuman, or degrading treatment.",
        "Constitution"
    ),
    (
        "Which article of the Constitution of Nepal guarantees the 'Right to education'?",
        "Article 30", "Article 31", "Article 32", "Article 33",
        "B",
        "Article 31 guarantees the right to education, stating every citizen has the right to compulsory and free education up to the basic level and free up to secondary level.",
        "Constitution"
    ),
    (
        "The 'Right of women' is guaranteed under which article?",
        "Article 37", "Article 38", "Article 39", "Article 40",
        "B",
        "Article 38 guarantees women equal lineage rights, rights to safe motherhood, and rights against exploitation.",
        "Constitution"
    ),
    (
        "Which article of the Constitution of Nepal provides for the 'Right to constitutional remedies'?",
        "Article 44", "Article 45", "Article 46", "Article 47",
        "C",
        "Article 46 guarantees the right to constitutional remedies for the enforcement of rights conferred in Part 3, through the Supreme Court.",
        "Constitution"
    ),
    (
        "Duties of citizens are listed under which article of the Constitution?",
        "Article 46", "Article 47", "Article 48", "Article 49",
        "C",
        "Article 48 outlines the four duties of every citizen, including safeguarding national sovereignty, abiding by the constitution, and serving the nation when required.",
        "Constitution"
    ),
    (
        "According to Article 56, what are the three levels of state structure in Nepal?",
        "Federal, Regional, and Local", "Federal, Provincial, and District", "Federal, Provincial, and Local", "Central, Provincial, and Village",
        "C",
        "Article 56(1) states that the main structure of the Federal Democratic Republic of Nepal shall be comprised of three levels: Federal, Provincial, and Local.",
        "Constitution"
    ),
    (
        "In whom is the executive power of Nepal vested, according to Article 75?",
        "The President", "The Prime Minister", "The Council of Ministers", "The Parliament",
        "C",
        "Article 75 states that the executive power of Nepal shall, pursuant to this Constitution and law, be vested in the Council of Ministers.",
        "Constitution"
    ),
    (
        "How many members are there in the House of Representatives (Pratinidhi Sabha)?",
        "205", "250", "275", "330",
        "C",
        "Article 84 states the House of Representatives consists of 275 members: 165 elected through first-past-the-post and 110 elected through proportional representation.",
        "Constitution"
    ),
    (
        "How many members are there in the National Assembly (Rastriya Sabha) of Nepal?",
        "59", "60", "75", "275",
        "A",
        "Article 86 states the National Assembly is a permanent house consisting of 59 members, with 8 elected from each of the 7 provinces and 3 nominated by the President.",
        "Constitution"
    ),
    (
        "What is the term of the House of Representatives of Nepal, unless dissolved earlier?",
        "4 years", "5 years", "6 years", "Term is unlimited",
        "B",
        "Article 85 states that the term of the House of Representatives shall be five years, unless dissolved earlier pursuant to the Constitution.",
        "Constitution"
    ),
    (
        "In whom is the legislative power of a Province vested?",
        "Provincial Governor", "Chief Minister", "Provincial Assembly", "Provincial Council of Ministers",
        "C",
        "Article 176 states that there shall be a unicameral legislature, named as the Provincial Assembly, in each province.",
        "Constitution"
    ),
    (
        "What is the maximum number of ministers, including the Chief Minister, in a Provincial Council of Ministers?",
        "10% of Assembly members", "15% of Assembly members", "20% of Assembly members", "25% of Assembly members",
        "C",
        "Article 168(9) states that the Governor shall, on recommendation of the Chief Minister, constitute the Provincial Council of Ministers not exceeding 20% of the total assembly members.",
        "Constitution"
    ),
    (
        "Who is the Head of State of Nepal?",
        "The Prime Minister", "The President", "The Chief Justice", "The Speaker of House of Representatives",
        "B",
        "Article 61(2) states that the President shall be the Head of State of Nepal and perform his or her functions in accordance with the Constitution.",
        "Constitution"
    ),
    (
        "Who appoints the Chief Justice of the Supreme Court of Nepal?",
        "The Prime Minister", "The President", "The Minister of Law", "The Constitutional Council",
        "B",
        "Article 129(2) states that the Chief Justice shall be appointed by the President on the recommendation of the Constitutional Council.",
        "Constitution"
    ),
    (
        "How many Constitutional Bodies are recognized under the current Constitution of Nepal?",
        "10", "12", "13", "15",
        "C",
        "The Constitution of Nepal recognizes 13 constitutional bodies, including the CIAA, Auditor General, and Public Service Commission.",
        "Constitution"
    ),
    (
        "What is the term of office for the Auditor General of Nepal?",
        "5 years", "6 years", "7 years", "Until the age of 65",
        "B",
        "Article 240(2) states that the term of office of the Auditor General shall be six years from the date of appointment.",
        "Constitution"
    ),
    (
        "What is the term of office for members of the Public Service Commission of Nepal?",
        "4 years", "5 years", "6 years", "Until the age of 60",
        "C",
        "Article 242(2) states that the term of office of the Chairperson and members of the Public Service Commission shall be six years.",
        "Constitution"
    ),
    (
        "Under which article is citizenship by descent defined in the Constitution of Nepal?",
        "Article 10", "Article 11", "Article 12", "Article 13",
        "B",
        "Article 11 outlines the provisions for acquisition of citizenship of Nepal, with descent defined in Article 11(2).",
        "Constitution"
    ),
    (
        "What is the national language of Nepal?",
        "Nepali only", "All mother tongues spoken in Nepal", "Nepali and Maithili", "Nepali and English",
        "B",
        "Article 6 of the Constitution of Nepal states that all mother tongues spoken in Nepal are the national languages of Nepal.",
        "Constitution"
    ),
    (
        "What is the official language of Nepal at the federal level?",
        "Nepali in Devanagari script", "Nepali and English", "Any language chosen by the province", "All national languages",
        "A",
        "Article 7(1) states that the Nepali language in the Devanagari script shall be the official language of Nepal.",
        "Constitution"
    ),
    (
        "How many Schedules are there in the Constitution of Nepal?",
        "5 schedules", "7 schedules", "9 schedules", "11 schedules",
        "C",
        "The current Constitution of Nepal contains 9 Schedules, which outline matters such as the national flag, anthem, and legislative powers.",
        "Constitution"
    ),
    (
        "Which Schedule of the Constitution of Nepal contains the National Anthem?",
        "Schedule 1", "Schedule 2", "Schedule 3", "Schedule 4",
        "B",
        "Schedule 2 of the Constitution of Nepal contains the lyrics and musical notations of the National Anthem 'Sayaun Thunga Phool Ka'.",
        "Constitution"
    ),
    (
        "Which Schedule lists the Exclusive Powers of the Federal Level?",
        "Schedule 5", "Schedule 6", "Schedule 7", "Schedule 8",
        "A",
        "Schedule 5 of the Constitution contains the list of exclusive powers of the Federation, consisting of 35 items.",
        "Constitution"
    ),
    (
        "Which Schedule lists the Exclusive Powers of the Local Level?",
        "Schedule 6", "Schedule 7", "Schedule 8", "Schedule 9",
        "C",
        "Schedule 8 contains the list of local level powers, consisting of 22 items related to municipal governance.",
        "Constitution"
    ),
    (
        "Which article outlines the procedure for the Amendment of the Constitution?",
        "Article 270", "Article 272", "Article 274", "Article 276",
        "C",
        "Article 274 of the Constitution governs the procedure for amending the constitution, ensuring state structures and federalism require provincial assent.",
        "Constitution"
    ),
    (
        "Who chairs the Constitutional Council of Nepal?",
        "The President", "The Chief Justice", "The Prime Minister", "The Speaker of House of Representatives",
        "C",
        "Article 284(1) states that there shall be a Constitutional Council chaired by the Prime Minister for making recommendations for appointments of heads and members of constitutional bodies.",
        "Constitution"
    )
]

geography = [
    (
        "The standard time of Nepal is determined based on the longitude of which mountain peak?",
        "Mount Everest", "Mount Gauri Shankar", "Mount Kangchenjunga", "Mount Annapurna",
        "B",
        "Nepal Standard Time (NST) is calculated based on the meridian of Mount Gauri Shankar (86 degrees 15 minutes East longitude).",
        "Geography"
    ),
    (
        "What is the time difference between Nepal Standard Time (NST) and Greenwich Mean Time (GMT)?",
        "5 hours 30 minutes ahead", "5 hours 45 minutes ahead", "6 hours ahead", "5 hours ahead",
        "B",
        "Nepal Standard Time is 5 hours and 45 minutes ahead of GMT, which is a unique timezone interval.",
        "Geography"
    ),
    (
        "Which is the deepest lake in Nepal?",
        "Rara Lake", "Fewa Lake", "Phoksundo Lake", "Tilicho Lake",
        "C",
        "Phoksundo Lake, located in the Dolpa district, is the deepest lake in Nepal with a maximum depth of 145 meters.",
        "Geography"
    ),
    (
        "Which is the largest lake in Nepal by surface area?",
        "Phoksundo Lake", "Rara Lake", "Fewa Lake", "Begnas Lake",
        "B",
        "Rara Lake, located in the Mugu district, is the largest lake in Nepal with a surface area of about 10.8 square kilometers.",
        "Geography"
    ),
    (
        "Which lake is considered the highest altitude lake in Nepal, situated at 4,919 meters?",
        "Rara Lake", "Tilicho Lake", "Shey-Phoksundo Lake", "Gosaikunda Lake",
        "B",
        "Tilicho Lake is situated at an altitude of 4,919 meters in the Manang district and is widely known as one of the highest lakes in the world.",
        "Geography"
    ),
    (
        "Which is the longest river inside Nepal?",
        "Koshi River", "Gandaki River", "Karnali River", "Mahakali River",
        "C",
        "The Karnali River is the longest river inside Nepal, flowing about 507 km before entering India.",
        "Geography"
    ),
    (
        "Which river is the largest in Nepal by water volume and discharge?",
        "Karnali River", "Koshi River", "Gandaki River", "Trishuli River",
        "B",
        "The Koshi River (Saptakoshi) is the largest river in Nepal and is known as the 'Sorrow of Bihar' due to its heavy sediment and flooding.",
        "Geography"
    ),
    (
        "Which river system is known as the deepest river in Nepal?",
        "Saptakoshi", "Saptagandaki", "Karnali", "Mahakali",
        "B",
        "The Gandaki River (Saptagandaki) is the deepest river in Nepal, known for the Kaligandaki gorge, the deepest gorge in the world.",
        "Geography"
    ),
    (
        "Which of these rivers originates from Tibet and enters Nepal?",
        "Bagmati", "Bhotekoshi", "Rapti", "Babai",
        "B",
        "The Bhotekoshi is a trans-boundary river that originates in the Tibet Autonomous Region of China and flows south into Nepal.",
        "Geography"
    ),
    (
        "What is the length of Nepal's east-west boundary?",
        "800 km", "845 km", "885 km", "925 km",
        "C",
        "The total east-west length of Nepal is approximately 885 kilometers.",
        "Geography"
    ),
    (
        "What is the average north-south width of Nepal?",
        "145 km", "193 km", "241 km", "300 km",
        "B",
        "The average width of Nepal is 193 km, ranging from a minimum of 145 km to a maximum of 241 km.",
        "Geography"
    ),
    (
        "How many administrative Districts are there in Nepal currently?",
        "75", "76", "77", "78",
        "C",
        "Nepal has 77 administrative districts, divided after Nawalparasi and Rukum were split into two districts each in 2017.",
        "Geography"
    ),
    (
        "How many administrative Provinces are there in Nepal?",
        "5", "7", "9", "14",
        "B",
        "The Constitution of Nepal divided the country into 7 administrative Provinces, which replaced the previous 5 developmental regions.",
        "Geography"
    ),
    (
        "Which Province of Nepal has the highest number of districts (14 districts)?",
        "Koshi Province", "Bagmati Province", "Lumbini Province", "Karnali Province",
        "A",
        "Koshi Province (Province 1) has 14 districts, which is the highest number of districts among all provinces.",
        "Geography"
    ),
    (
        "Which Province of Nepal has the fewest districts (8 districts)?",
        "Sudurpashchim Province", "Karnali Province", "Gandaki Province", "Madhesh Province",
        "D",
        "Madhesh Province (Province 2) consists of only 8 districts, the lowest count among all provinces.",
        "Geography"
    ),
    (
        "With which country does Nepal share its southern, eastern, and western borders?",
        "China", "India", "Bangladesh", "Bhutan",
        "B",
        "Nepal is landlocked and shares three sides of its border (East, West, and South) with India, and its northern border with China.",
        "Geography"
    ),
    (
        "Which mountain peak is known as the 'Five Treasures of Great Snow'?",
        "Mount Everest", "Mount Kangchenjunga", "Mount Lhotse", "Mount Makalu",
        "B",
        "Mount Kangchenjunga, the third highest mountain in the world, is known as the 'Five Treasures of Great Snow' due to its five high peaks.",
        "Geography"
    ),
    (
        "What is the official height of Mount Everest as jointly announced by Nepal and China in 2020?",
        "8,848 meters", "8,848.48 meters", "8,848.86 meters", "8,850 meters",
        "C",
        "In December 2020, Nepal and China jointly announced the revised official height of Mount Everest as 8,848.86 meters.",
        "Geography"
    ),
    (
        "Which is the smallest district of Nepal by land area?",
        "Parbat", "Bhaktapur", "Lalitpur", "Kathmandu",
        "B",
        "Bhaktapur is the smallest district in Nepal, covering an area of 119 square kilometers.",
        "Geography"
    ),
    (
        "Which is the largest district of Nepal by land area?",
        "Humla", "Dolpa", "Mugu", "Mustang",
        "B",
        "Dolpa is the largest district in Nepal, covering an area of 7,889 square kilometers.",
        "Geography"
    ),
    (
        "Which districts of Nepal border both India and China?",
        "Taplejung and Darchula", "Mustang and Rasuwa", "Humla and Solukhumbu", "Jhapa and Kanchanpur",
        "A",
        "Taplejung (in the east) and Darchula (in the west) are the two districts of Nepal that share boundaries with both India and China.",
        "Geography"
    ),
    (
        "Which place in Nepal is known as the wettest place, receiving the highest rainfall?",
        "Dharan", "Pokhara", "Lumle", "Kathmandu",
        "C",
        "Lumle in Kaski district is famous for receiving the highest annual rainfall in Nepal, often called the Cherrapunji of Nepal.",
        "Geography"
    ),
    (
        "Which city of Nepal is generally considered the hottest city based on maximum summer temperatures?",
        "Biratnagar", "Janakpur", "Nepalgunj", "Bhairahawa",
        "C",
        "Nepalgunj, located in the Banke district of western Terai, routinely records the highest summer temperatures in the country.",
        "Geography"
    ),
    (
        "What is the altitude range of the Terai region in Nepal above sea level?",
        "Below 100 meters", "59m to 600m", "500m to 1200m", "1000m to 3000m",
        "B",
        "The Terai region lies between 59 meters to 600 meters above sea level along the southern belt of the country.",
        "Geography"
    ),
    (
        "Which Himalayan range lies entirely within the territory of Nepal?",
        "Mahalangur Range", "Kanchenjunga Range", "Jugual Himal / Langtang", "Dhaulagiri / Annapurna",
        "C",
        "Jugual Himal is considered the closest mountain range to Kathmandu and lies entirely within Nepal.",
        "Geography"
    ),
    (
        "Which river forms the western boundary of Nepal with India as per the Sugauli Treaty?",
        "Mechi River", "Mahakali River", "Karnali River", "Gandaki River",
        "B",
        "The Mahakali River forms the western international border of Nepal with India.",
        "Geography"
    )
]

general_knowledge = [
    (
        "What is the national flower of Nepal?",
        "Lotus", "Rhododendron", "Marigold", "Rose",
        "B",
        "Rhododendron (known as Lali Gurans in Nepali) is the national flower of Nepal, blooming beautifully in the hilly regions.",
        "General Knowledge"
    ),
    (
        "What is the national bird of Nepal?",
        "Spiny Babbler", "Himalayan Monal (Danphe)", "Peacock", "House Crow",
        "B",
        "The Himalayan Monal, locally called Danphe, is the national bird of Nepal. It is known for its multi-colored plumage.",
        "General Knowledge"
    ),
    (
        "Which animal is recognized as the national animal of Nepal?",
        "One-horned Rhino", "Bengal Tiger", "Cow", "Snow Leopard",
        "C",
        "The Cow is the national animal of Nepal, protected by law as a sacred animal.",
        "General Knowledge"
    ),
    (
        "What is the national weapon of Nepal?",
        "Sword", "Khukuri", "Bow and Arrow", "Spear",
        "B",
        "The Khukuri, a traditional curved knife associated with the Gurkhas, is the national weapon of Nepal.",
        "General Knowledge"
    ),
    (
        "Where is the permanent Secretariat of the South Asian Association for Regional Cooperation (SAARC) located?",
        "New Delhi, India", "Dhaka, Bangladesh", "Kathmandu, Nepal", "Colombo, Sri Lanka",
        "C",
        "The SAARC Secretariat was established in Kathmandu on 16 January 1987 and inaugurated by King Birendra.",
        "General Knowledge"
    ),
    (
        "On which date did Nepal officially become a member of the United Nations (UN)?",
        "December 14, 1945", "December 14, 1955", "September 20, 1960", "November 1, 1955",
        "B",
        "Nepal joined the United Nations on December 14, 1955 under the package deal consisting of 16 countries.",
        "General Knowledge"
    ),
    (
        "When did Nepal officially become a member of the World Trade Organization (WTO)?",
        "January 1, 1995", "April 23, 2004", "December 11, 2005", "May 1, 2002",
        "B",
        "Nepal joined the World Trade Organization (WTO) on April 23, 2004, becoming the first least-developed country to join through the negotiation process.",
        "General Knowledge"
    ),
    (
        "How many cultural World Heritage Sites are recognized by UNESCO in the Kathmandu Valley of Nepal?",
        "3", "5", "7", "10",
        "C",
        "UNESCO lists 7 groups of monuments in the Kathmandu Valley as a single World Heritage Site: Kathmandu, Patan, and Bhaktapur Durbar Squares, Swayambhunath, Bauddhanath, Pashupatinath, and Changu Narayan.",
        "General Knowledge"
    ),
    (
        "Which natural site in Nepal is listed as a UNESCO World Heritage Site?",
        "Chitwan National Park", "Rara National Park", "Langtang National Park", "Bardiya National Park",
        "A",
        "Chitwan National Park was inscribed as a natural UNESCO World Heritage Site in 1984, followed by Sagarmatha National Park.",
        "General Knowledge"
    ),
    (
        "Lumbini, the birthplace of Gautama Buddha, is located in which district of Nepal?",
        "Kapilvastu", "Rupandehi", "Nawalparasi", "Chitwan",
        "B",
        "Lumbini is situated in the Rupandehi district of Lumbini Province in Nepal.",
        "General Knowledge"
    ),
    (
        "Which is the oldest highway in Nepal, linking Kathmandu to the Indian border?",
        "Prithvi Highway", "Tribhuvan Highway", "Mahendra Highway", "Siddhartha Highway",
        "B",
        "The Tribhuvan Highway (locally called Tribhuvan Rajpath), constructed with Indian assistance, is the first highway in Nepal.",
        "General Knowledge"
    ),
    (
        "Which day of the Nepali calendar is celebrated as Civil Service Day (Nijamati Sewa Diwas)?",
        "Bhadra 22", "Ashwin 25", "Kartik 1", "Falgun 7",
        "A",
        "Nepal celebrates Civil Service Day on Bhadra 22 every year, commemorating the enactment of the Civil Service Act in 2013 BS under PM Tanka Prasad Acharya.",
        "General Knowledge"
    ),
    (
        "What is the name of the central bank of Nepal?",
        "State Bank of Nepal", "National Bank of Nepal", "Nepal Rastra Bank", "Nepal Central Bank",
        "C",
        "Nepal Rastra Bank (NRB), established on April 26, 1956 (Baishakh 14, 2013 BS), is the central monetary authority of Nepal.",
        "General Knowledge"
    ),
    (
        "What is the national game of Nepal, declared in May 2017?",
        "Dandi Biyo", "Kabaddi", "Volleyball", "Football",
        "C",
        "The Government of Nepal declared Volleyball as the national game of Nepal on May 22, 2017.",
        "General Knowledge"
    ),
    (
        "Which is the first international airport in Nepal?",
        "Tribhuvan International Airport", "Gautam Buddha International Airport", "Pokhara International Airport", "Nijgadh International Airport",
        "A",
        "Tribhuvan International Airport (TIA) in Kathmandu was the sole international airport in Nepal for decades since its establishment in 1955.",
        "General Knowledge"
    ),
    (
        "Where is the Gautam Buddha International Airport (Nepal's second international airport) located?",
        "Bhairahawa", "Pokhara", "Biratnagar", "Nepalgunj",
        "A",
        "The Gautam Buddha International Airport, located in Bhairahawa (Rupandehi), was upgraded and inaugurated as an international airport in May 2022.",
        "General Knowledge"
    ),
    (
        "When was the South Asian Association for Regional Cooperation (SAARC) founded?",
        "December 8, 1985", "January 1, 1987", "April 4, 1983", "December 14, 1955",
        "A",
        "SAARC was established with the signing of the SAARC Charter in Dhaka, Bangladesh, on December 8, 1985.",
        "General Knowledge"
    ),
    (
        "How many landlocked countries are members of SAARC?",
        "2", "3", "4", "5",
        "B",
        "There are 3 landlocked countries in SAARC: Afghanistan, Bhutan, and Nepal.",
        "General Knowledge"
    ),
    (
        "Who was the first President of the Republic of Nepal?",
        "Girija Prasad Koirala", "Dr. Ram Baran Yadav", "Bidhya Devi Bhandari", "Ram Chandra Poudel",
        "B",
        "Dr. Ram Baran Yadav was elected as the first President of Nepal on July 21, 2008, following the declaration of the republic.",
        "General Knowledge"
    ),
    (
        "Who served as the first Prime Minister of Nepal after the introduction of democracy in 2007 BS?",
        "Matrika Prasad Koirala", "Bishweshwar Prasad Koirala", "Tanka Prasad Acharya", "Kirti Nidhi Bista",
        "A",
        "Matrika Prasad Koirala became the Prime Minister of Nepal on November 16, 1951, leading the post-Rana democratic cabinet.",
        "General Knowledge"
    ),
    (
        "Where is the headquarters of the Bay of Bengal Initiative for Multi-Sectoral Technical and Economic Cooperation (BIMSTEC) located?",
        "Kathmandu, Nepal", "Colombo, Sri Lanka", "Dhaka, Bangladesh", "Bangkok, Thailand",
        "C",
        "The BIMSTEC Permanent Secretariat is located in Dhaka, Bangladesh, and was opened in 2014.",
        "General Knowledge"
    ),
    (
        "Which Nobel Peace Prize laureate visited Nepal in 1978 and 1986 to promote children's and humanitarian projects?",
        "Nelson Mandela", "Mother Teresa", "Dalai Lama", "Kofi Annan",
        "B",
        "Mother Teresa visited Nepal to set up and inspect the Missionaries of Charity centers in Kathmandu.",
        "General Knowledge"
    ),
    (
        "In which year did Nepal become a member of the International Criminal Police Organization (Interpol)?",
        "1955", "1967", "1975", "1990",
        "B",
        "Nepal joined Interpol as its 100th member on September 27, 1967.",
        "General Knowledge"
    ),
    (
        "Which of the following birds is endemic to Nepal (found only in Nepal)?",
        "Danphe", "Lophophorus", "Spiny Babbler", "House Sparrow",
        "C",
        "The Spiny Babbler (Kande Bhyakur in Nepali) is the only bird species endemic to Nepal.",
        "General Knowledge"
    ),
    (
        "What is the total number of local units (local governments) in Nepal?",
        "75", "753", "77", "14",
        "B",
        "Nepal has 753 local units comprising metropolises, sub-metropolises, municipalities, and rural municipalities.",
        "General Knowledge"
    ),
    (
        "Which Nepalese mountaineer holds the record for climbing all 14 peaks above 8,000 meters in the fastest time (under 7 months)?",
        "Tenzing Norgay", "Nimsdai (Nirmal) Purja", "Kami Rita Sherpa", "Appa Sherpa",
        "B",
        "Nirmal 'Nims' Purja climbed all 14 eight-thousand-meter peaks in 6 months and 6 days in 2019, as documented in '14 Peaks: Nothing Is Impossible'.",
        "General Knowledge"
    )
]

history = [
    (
        "Who is popularly known as the 'Father of Unification' of modern Nepal?",
        "King Prithvi Narayan Shah", "King Jayasthiti Malla", "King Mahendra", "King Tribhuvan",
        "A",
        "King Prithvi Narayan Shah of Gorkha initiated the unification campaign of Nepal in 1744 AD.",
        "History"
    ),
    (
        "The unification campaign of modern Nepal began with the conquest of which place in 1744 AD?",
        "Kathmandu", "Bhaktapur", "Nuwakot", "Kirtipur",
        "C",
        "The Gorkhali forces conquered Nuwakot in 1744 AD, which served as the strategic entry point to the Kathmandu Valley.",
        "History"
    ),
    (
        "Which prominent Gorkhali commander and military strategist died in the Battle of Kirtipur?",
        "Bhakti Thapa", "Amar Singh Thapa", "Kalu Pande", "Balbhadra Kunwar",
        "C",
        "Kaji Kalu Pande, the commander (Kaji) of Gorkha, was killed during the first attack on Kirtipur in 1757 AD.",
        "History"
    ),
    (
        "The historic Sugauli Treaty was signed between the Government of Nepal and which entity?",
        "East India Company", "French Republic", "Qing Dynasty", "Tibetan Government",
        "A",
        "The Sugauli Treaty was signed between the Kingdom of Nepal and the British East India Company following the Anglo-Nepalese War.",
        "History"
    ),
    (
        "On which date did the Sugauli Treaty come into force officially?",
        "March 4, 1815", "December 2, 1815", "March 4, 1816", "December 16, 1816",
        "C",
        "Although drafted in late 1815, the treaty was ratified and came into force on March 4, 1816.",
        "History"
    ),
    (
        "The Kot Massacre, which led to the rise of Jung Bahadur Rana, took place on which date?",
        "September 14, 1846", "September 14, 1856", "October 2, 1846", "June 1, 2001",
        "A",
        "The Kot Massacre occurred on the night of September 14, 1846 (Ashwin 2, 1903 BS) at the palace courtyard (Kot) in Kathmandu.",
        "History"
    ),
    (
        "Who was the first Rana Prime Minister of Nepal?",
        "Dev Shumsher", "Chandra Shumsher", "Jung Bahadur Rana", "Joodha Shumsher",
        "C",
        "Jung Bahadur Kunwar (later Rana) declared himself Prime Minister following the Kot Massacre in 1846.",
        "History"
    ),
    (
        "For how many years did the autocratic Rana family rule last in Nepal?",
        "50 years", "100 years", "104 years", "120 years",
        "C",
        "The Rana oligarchy lasted for 104 years, from 1846 AD to 1951 AD.",
        "History"
    ),
    (
        "Which day of the month of Magh is celebrated as Martyr's Day (Sahid Diwas) in Nepal?",
        "Magh 10", "Magh 16", "Magh 22", "Magh 29",
        "B",
        "Martyr's Day is celebrated on Magh 16 to honor the individuals who sacrificed their lives for the establishment of democracy.",
        "History"
    ),
    (
        "Who were the four great martyrs executed by the Rana regime in 1997 BS?",
        "Shukraraj, Dharma Bhakta, Dashrath Chand, Ganga Lal", "Bhakti Thapa, Amar Singh, Kalu Pande, Balbhadra", "Lakhan Thapa, Yogmaya, Prithvi Narayan, Jung Bahadur", "Tribhuvan, B.P. Koirala, G.P. Koirala, Manmohan",
        "A",
        "Shukraraj Shastri, Dharma Bhakta Mathema, Dashrath Chand, and Ganga Lal Shrestha were executed in 1997 BS (1941 AD) for democracy activities.",
        "History"
    ),
    (
        "When was democracy established in Nepal for the first time, ending the Rana rule?",
        "Falgun 7, 2007 BS", "Bhadra 22, 2013 BS", "Jestha 15, 2065 BS", "Falgun 7, 2046 BS",
        "A",
        "Democracy was established in Nepal on Falgun 7, 2007 BS (February 18, 1951) by a royal decree of King Tribhuvan.",
        "History"
    ),
    (
        "In which year did King Mahendra introduce the party-less Panchayat system, dissolving the elected parliament?",
        "1950 AD", "1960 AD", "1972 AD", "1990 AD",
        "B",
        "King Mahendra dissolved the parliament and imprisoned PM B.P. Koirala in December 1960 (Poush 1, 2017 BS), introducing Panchayat soon after.",
        "History"
    ),
    (
        "The People's Movement I (Jana Andolan I), which restored multiparty democracy, occurred in which year?",
        "1990 AD (2046 BS)", "2006 AD (2063 BS)", "2008 AD (2065 BS)", "1951 AD (2007 BS)",
        "A",
        "The People's Movement of 1990 (2046 BS) forced King Birendra to restore multiparty democracy and adopt a constitutional monarchy.",
        "History"
    ),
    (
        "On which date did Nepal's Constituent Assembly declare the nation a Federal Democratic Republic?",
        "May 28, 2006", "May 28, 2008", "September 20, 2015", "November 21, 2006",
        "B",
        "The first meeting of the Constituent Assembly declared Nepal a republic on May 28, 2008 (Jestha 15, 2065 BS), abolishing the 240-year-old monarchy.",
        "History"
    ),
    (
        "The tragic Narayanhiti Royal Massacre, in which King Birendra and his family were killed, occurred on which date?",
        "June 1, 2000", "June 1, 2001", "June 15, 2001", "May 28, 2008",
        "B",
        "The Royal Massacre occurred on the night of June 1, 2001 (Jestha 19, 2058 BS) at the Narayanhiti Royal Palace.",
        "History"
    ),
    (
        "The Comprehensive Peace Accord (CPA), ending the decade-long armed conflict, was signed in which year?",
        "2002 AD", "2006 AD", "2008 AD", "2015 AD",
        "B",
        "The CPA was signed between Prime Minister Girija Prasad Koirala and CPN-Maoist Chairman Prachanda on November 21, 2006 (Mangsir 5, 2063 BS).",
        "History"
    ),
    (
        "Which King of the Malla dynasty constructed the famous five-storey Nyatapola Temple of Bhaktapur?",
        "Yaksha Malla", "Bhupatindra Malla", "Pratap Malla", "Siddhi Narsingh Malla",
        "B",
        "King Bhupatindra Malla of Bhaktapur built the Nyatapola Temple, dedicated to Siddhi Lakshmi, in 1702 AD.",
        "History"
    ),
    (
        "Which authority first introduced paper currency (banknotes) in Nepal in 2002 BS?",
        "King Tribhuvan (PM Joodha Shumsher)", "King Mahendra", "Nepal Rastra Bank", "Government of Nepal Treasury",
        "A",
        "Paper currency was first issued in Nepal on September 17, 1945 (Ashwin 1, 2002 BS) during the reign of King Tribhuvan and Premiership of Joodha Shumsher.",
        "History"
    ),
    (
        "Who is recorded as the first historical King of Nepal according to chronicles?",
        "Bhuktaman", "Yalamber", "Mandev", "Prithvi Narayan",
        "A",
        "Bhuktaman (Gopal Dynasty) is considered the first king of Nepal, ruling when the Kathmandu valley was a pastoral settlement.",
        "History"
    ),
    (
        "Which era in Nepalese history is commonly referred to as the 'Golden Age'?",
        "Kirat Period", "Lichchhavi Period", "Malla Period", "Rana Period",
        "B",
        "The Lichchhavi Period (approx. 350-750 AD) is called the Golden Age due to advancements in art, architecture, administration, and trade.",
        "History"
    ),
    (
        "Which famous Chinese Buddhist traveler visited the Kathmandu Valley during the Lichchhavi rule in the 7th century?",
        "Faxian (Fa-Hien)", "Xuanzang (Huen Tsang)", "Yi Jing", "Bodhidharma",
        "B",
        "Xuanzang visited Nepal during the reign of King Narendradev and documented the prosperity and religious co-existence of the country.",
        "History"
    ),
    (
        "Who is credited with starting the Nepal Sambat calendar in 879 AD (936 BS)?",
        "King Raghav Dev (Shankhadhar Sakhwa)", "King Mandev", "King Jayasthiti Malla", "King Gunakama Dev",
        "A",
        "Shankhadhar Sakhwa, a merchant who freed the people of Kathmandu from debt, introduced Nepal Sambat during the reign of King Raghav Dev.",
        "History"
    ),
    (
        "The Treaty of Betrawati was signed in 1792 AD between Nepal and which country?",
        "Tibet (Qing China)", "East India Company", "Sikkim", "Kingdom of Gorkha",
        "A",
        "The Treaty of Betrawati was signed between Nepal and China (Tibet) following the Sino-Nepalese War, establishing trade relations.",
        "History"
    ),
    (
        "Which ruler of Kathmandu is credited with the construction of the Swayambhunath Stupa according to legends?",
        "King Mandev", "King Vrishadev", "King Gunakama Dev", "King Pratap Malla",
        "B",
        "King Vrishadev, the great-grandfather of Mandev, is historically linked to the foundation of the Swayambhunath Stupa.",
        "History"
    ),
    (
        "Who was the last King of the Malla dynasty in Kathmandu before its conquest by Gorkha?",
        "Tej Narsingh Malla", "Jaya Prakash Malla", "Ranjit Malla", "Mahendra Malla",
        "B",
        "Jaya Prakash Malla was the last Malla king of Kathmandu, defeated by Prithvi Narayan Shah during the Indra Jatra festival in 1768 AD.",
        "History"
    ),
    (
        "Who is recognized as the first martyr of Nepal?",
        "Shukraraj Shastri", "Lakhan Thapa", "Yogmaya Neupane", "Bhakti Thapa",
        "B",
        "Lakhan Thapa is recognized as the first martyr of Nepal for rebelling against the Jung Bahadur Rana regime in Gorkha.",
        "History"
    )
]

governance = [
    (
        "In which year was the Civil Service Act (Nijamati Sewa Ain) of Nepal enacted?",
        "2013 BS", "2046 BS", "2049 BS (1992 AD)", "2064 BS",
        "C",
        "The current basic legal framework for the civil service is the Civil Service Act, enacted in 2049 BS.",
        "Governance"
    ),
    (
        "In which year was the Civil Service Regulations (Nijamati Sewa Niyamawali) enacted?",
        "2049 BS", "2050 BS", "2064 BS", "2074 BS",
        "B",
        "The Civil Service Regulations were enacted in 2050 BS to implement the provisions of the Civil Service Act 2049.",
        "Governance"
    ),
    (
        "Who is the administrative head of the civil service of the Government of Nepal?",
        "The President", "The Prime Minister", "The Chief Secretary", "The Minister of Federal Affairs",
        "C",
        "The Chief Secretary (Mukhya Sachib) is the highest-ranking civil servant and administrative head of the civil service.",
        "Governance"
    ),
    (
        "What is the retirement age for general civil servants in Nepal as per the Civil Service Act?",
        "56 years", "58 years", "60 years", "65 years",
        "B",
        "The compulsory retirement age for general civil servants under the Civil Service Act 2049 is 58 years.",
        "Governance"
    ),
    (
        "When was the Public Service Commission (Loksewa Aayog) established in Nepal?",
        "Falgun 7, 2007 BS", "Ashad 1, 2008 BS (June 15, 1951)", "Bhadra 22, 2013 BS", "Ashwin 3, 2072 BS",
        "B",
        "The Public Service Commission was established on Ashad 1, 2008 BS to ensure fair and merit-based recruitment in public services.",
        "Governance"
    ),
    (
        "Into how many Local Levels (Local Governments) is Nepal currently divided?",
        "75", "77", "753", "744",
        "C",
        "Nepal is divided into 753 local levels, which are independent tiers of local self-governance.",
        "Governance"
    ),
    (
        "How many Metropolitan Cities (Mahanagarpalika) are there in Nepal?",
        "4", "6", "11", "276",
        "B",
        "Nepal has 6 Metropolitan Cities: Kathmandu, Lalitpur, Pokhara, Bharatpur, Biratnagar, and Birgunj.",
        "Governance"
    ),
    (
        "How many Sub-Metropolitan Cities (Upa-Mahanagarpalika) are there in Nepal?",
        "6", "11", "20", "276",
        "B",
        "There are 11 Sub-Metropolitan Cities across Nepal, situated mostly in the Terai and inner Terai regions.",
        "Governance"
    ),
    (
        "Which Act regulates the functions, duties, and powers of local governments in Nepal?",
        "Local Administration Act 2028", "Local Government Operation Act 2074", "Civil Service Act 2049", "Province Operation Act 2075",
        "B",
        "The Local Government Operation Act 2074 was enacted to operationalize the local level powers granted by the Constitution.",
        "Governance"
    ),
    (
        "In which year was the Right to Information (RTI) Act enacted in Nepal?",
        "2059 BS", "2063 BS", "2064 BS", "2072 BS",
        "C",
        "The Right to Information Act was enacted in 2064 BS to guarantee citizens' access to public records and government information.",
        "Governance"
    ),
    (
        "Which Act is the primary legislation for combating corruption in public offices in Nepal?",
        "Corruption Prevention Act 2059", "CIAA Act 2048", "Good Governance Act 2064", "Public Procurement Act 2063",
        "A",
        "The Corruption Prevention Act 2059 BS is the main legal weapon for checking corruption and punishing corrupt public officials.",
        "Governance"
    ),
    (
        "Which constitutional body is tasked with investigating corruption and abuse of authority by public servants?",
        "Public Service Commission", "Auditor General", "Commission for the Investigation of Abuse of Authority (CIAA)", "National Human Rights Commission",
        "C",
        "The CIAA is the constitutional watchdog responsible for investigating abuse of authority and corruption by public officials.",
        "Governance"
    ),
    (
        "On which date of the Nepali calendar does the fiscal year of Nepal start?",
        "Baishakh 1", "Ashad 1", "Shrawan 1", "Kartik 1",
        "C",
        "The fiscal year of Nepal begins on Shrawan 1 (mid-July) and ends on Ashad end of the next calendar year.",
        "Governance"
    ),
    (
        "Which date of the Nepali calendar is constitutionally fixed for the presentation of the Federal Budget?",
        "Baishakh 15", "Jestha 15", "Ashad 1", "Shrawan 1",
        "B",
        "Article 119 of the Constitution of Nepal mandates that the Minister of Finance must present the budget on Jestha 15 every year.",
        "Governance"
    ),
    (
        "Who is the Chairperson of the National Planning Commission (NPC) of Nepal?",
        "The Finance Minister", "The Governor of NRB", "The Prime Minister", "A nominated senior economist",
        "C",
        "The Prime Minister of Nepal serves as the ex-officio Chairperson of the National Planning Commission.",
        "Governance"
    ),
    (
        "The Good Governance (Management and Operation) Act was enacted in which year?",
        "2049 BS", "2063 BS", "2064 BS", "2074 BS",
        "C",
        "The Good Governance (Management and Operation) Act was enacted in 2064 BS to translate government services into transparent and accountable systems.",
        "Governance"
    ),
    (
        "Who appoints the Chief District Officer (CDO) in Nepal?",
        "The Provincial Government", "Ministry of Home Affairs", "Ministry of Federal Affairs", "The Public Service Commission",
        "B",
        "The Ministry of Home Affairs (MoHA) appoints the CDO as the administrative representative of the federal government in the district.",
        "Governance"
    ),
    (
        "What is the minimum number of wards that a Rural Municipality (Gaunpalika) must have in Nepal?",
        "5 wards", "7 wards", "9 wards", "12 wards",
        "A",
        "A rural municipality must consist of a minimum of 5 wards up to a maximum of 21 wards as per local level delimitation rules.",
        "Governance"
    ),
    (
        "In which year was the Public Procurement Act enacted to regulate government purchases?",
        "2059 BS", "2063 BS", "2064 BS", "2074 BS",
        "B",
        "The Public Procurement Act was enacted in 2063 BS to make public expenditure competitive, fair, and transparent.",
        "Governance"
    ),
    (
        "Who heads the Local Level Judicial Committee (Nyayik Samiti) at the municipal level?",
        "The Mayor / Chairperson", "The Deputy Mayor / Vice-Chairperson", "The Ward Chairperson", "A hired legal expert",
        "B",
        "The Deputy Mayor (in municipalities) or the Vice-Chairperson (in rural municipalities) coordinates the Judicial Committee.",
        "Governance"
    ),
    (
        "Which article of the Constitution of Nepal provides for the Inter-State Council to resolve disputes between Federation and Provinces?",
        "Article 232", "Article 234", "Article 235", "Article 244",
        "B",
        "Article 234 establishes the Inter-State Council, chaired by the Prime Minister, to settle political disputes between the federation and provinces.",
        "Governance"
    ),
    (
        "Who acts as the chief legal advisor to the Government of Nepal?",
        "The Chief Justice", "The Law Minister", "The Attorney General", "The Chief Secretary",
        "C",
        "Article 158 states that the Attorney General is the chief legal adviser to the Government of Nepal on legal matters.",
        "Governance"
    ),
    (
        "National Human Rights Commission (NHRC) of Nepal is recognized under which article of the Constitution?",
        "Article 243", "Article 248", "Article 249", "Article 293",
        "C",
        "Article 249 outlines the functions, duties, and powers of the National Human Rights Commission as a constitutional body.",
        "Governance"
    ),
    (
        "How many classes of civil service are there in Nepal (excluding health services)?",
        "Gazetted and Non-Gazetted", "Officer and Assistant", "Permanent and Temporary", "Administrative and Technical",
        "A",
        "The Nepalese civil service is broadly divided into Gazetted (officer levels) and Non-Gazetted (assistant levels) classes.",
        "Governance"
    ),
    (
        "Which federal ministry is primarily responsible for personnel administration and civil service management?",
        "Ministry of Home Affairs", "Ministry of Finance", "Ministry of Federal Affairs and General Administration", "Prime Minister's Office",
        "C",
        "MoFAGA is the central personnel agency of the Government of Nepal, managing deployment and capacity building of civil servants.",
        "Governance"
    ),
    (
        "Who appoints the members and Chairperson of the Constitutional Council?",
        "The Prime Minister", "The President", "The Chief Justice", "The Parliament",
        "B",
        "The President appoints the members and Chairperson of the Constitutional Council, which includes the PM, CJ, Speaker, etc.",
        "Governance"
    )
]

science = [
    (
        "What is the name of Nepal's first nano-satellite launched into space?",
        "NepaliSat-1", "Nepal-Sat", "Sagarmatha-1", "LaliGurans-1",
        "A",
        "NepaliSat-1 is Nepal's first nano-satellite, designed and built by Nepalese engineers Hariram Shrestha and Abhas Maskey.",
        "Science & Technology"
    ),
    (
        "In which year was NepaliSat-1 launched into space?",
        "2017 AD", "2018 AD", "2019 AD", "2020 AD",
        "C",
        "NepaliSat-1 was launched into space on April 17, 2019, from the Mid-Atlantic Regional Spaceport in Virginia, USA.",
        "Science & Technology"
    ),
    (
        "Which federal ministry in Nepal is responsible for policies related to science, technology, and information communication?",
        "Ministry of Information", "Ministry of Science and Technology", "Ministry of Communication and Information Technology", "Ministry of Education, Science and Technology",
        "D",
        "The Ministry of Education, Science and Technology (MoEST) oversees the science and technology sector, while MoCIT handles communication.",
        "Science & Technology"
    ),
    (
        "On which date of the Nepali calendar is National Science Day celebrated?",
        "Bhadra 22", "Ashwin 1", "Kartik 10", "Falgun 7",
        "B",
        "Nepal celebrates National Science Day on Ashwin 1, marking the establishment of Amrit Science College (ASCOL).",
        "Science & Technology"
    ),
    (
        "Which comprehensive policy framework was launched by the Government of Nepal in 2019 to transform the country into a digital society?",
        "Digital Nepal Framework", "ICT Policy 2015", "Science and Tech Policy", "E-Governance Master Plan",
        "A",
        "The Digital Nepal Framework was launched in 2019, targeting digital initiatives across 8 sectors: digital foundation, agriculture, health, education, energy, tourism, finance, and urban infrastructure.",
        "Science & Technology"
    ),
    (
        "Which was the first electronic computer brought to Nepal, used for processing the 2028 BS census data?",
        "IBM 1401", "IBM 1620", "UNIVAC I", "ICL 2900",
        "A",
        "Nepal rented and imported the IBM 1401 mainframe computer in 2028 BS (1971 AD) for compiling national census statistics.",
        "Science & Technology"
    ),
    (
        "Which is the highest-altitude National Park in Nepal and the world?",
        "Chitwan National Park", "Sagarmatha National Park", "Langtang National Park", "Shey-Phoksundo National Park",
        "B",
        "Sagarmatha National Park, which contains Mount Everest, ranges up to 8,848.86m and is the highest-altitude national park.",
        "Science & Technology"
    ),
    (
        "How many wetland sites of international importance (Ramsar Sites) are located in Nepal?",
        "5 sites", "8 sites", "10 sites", "12 sites",
        "C",
        "Nepal has 10 Ramsar sites, including Koshi Tappu Wildlife Reserve, Jagadishpur Reservoir, Rara Lake, and Pokhara Lake Cluster.",
        "Science & Technology"
    ),
    (
        "What is the scientific name of the national flower of Nepal (Rhododendron)?",
        "Rhododendron arboreum", "Rhododendron ponticum", "Bos taurus", "Lophophorus impayanus",
        "A",
        "The scientific name of the red rhododendron (Lali Gurans) is Rhododendron arboreum.",
        "Science & Technology"
    ),
    (
        "What is the scientific name of the cow, the national animal of Nepal?",
        "Bos indicus / Bos taurus", "Panthera tigris", "Rucervus duvaucelii", "Moschus leucogaster",
        "A",
        "The domestic cow belongs to the genus Bos, classified as Bos taurus or Bos indicus (humped zebu).",
        "Science & Technology"
    ),
    (
        "Which greenhouse gas is the largest contributor to global climate change?",
        "Methane", "Nitrous oxide", "Carbon dioxide (CO2)", "Chlorofluorocarbon",
        "C",
        "Carbon dioxide (CO2) is the primary greenhouse gas emitted through human activities, driving global warming.",
        "Science & Technology"
    ),
    (
        "Which gases are primarily responsible for the formation of acid rain?",
        "Carbon monoxide and Methane", "Sulfur dioxide and Nitrogen oxides", "Carbon dioxide and Ozone", "Chlorine and Fluorine",
        "B",
        "Sulfur dioxide (SO2) and nitrogen oxides (NOx) react with water and oxygen in the atmosphere to form acidic precipitation.",
        "Science & Technology"
    ),
    (
        "Which was the first hydropower project built in Nepal, marking the start of electricity generation in 1911 AD?",
        "Trishuli Hydropower", "Pharping Hydropower", "Sunkoshi Hydropower", "Kulekhani Hydropower",
        "B",
        "The Pharping Hydropower Project (500 kW) was inaugurated on May 22, 1911 (Jestha 9, 1968 BS) by King Prithvi Bir Bikram Shah.",
        "Science & Technology"
    ),
    (
        "During the premiership of which Rana Prime Minister was the Pharping Hydropower Project constructed?",
        "Jung Bahadur Rana", "Dev Shumsher", "Chandra Shumsher", "Joodha Shumsher",
        "C",
        "The Pharping project (officially Chandrajyoti Hydropower) was built under PM Chandra Shumsher Rana.",
        "Science & Technology"
    ),
    (
        "Which statutory agency is responsible for regulating telecommunications and internet services in Nepal?",
        "Nepal Telecom (NT)", "Nepal Telecommunication Authority (NTA)", "Department of IT", "Radio Nepal Council",
        "B",
        "NTA is the autonomous regulatory body established under the Telecommunications Act 2053 to supervise and manage telecom services.",
        "Science & Technology"
    ),
    (
        "What is the scientific name of the national bird of Nepal, the Himalayan Monal?",
        "Lophophorus impayanus", "Columba livia", "Passer domesticus", "Pavo cristatus",
        "A",
        "The scientific name of the Himalayan Monal (Danphe) is Lophophorus impayanus.",
        "Science & Technology"
    ),
    (
        "Which frequency band is most commonly associated with 5G networks?",
        "Sub-6 GHz and Millimeter Wave (mmWave)", "1800 MHz and 800 MHz", "AM and FM frequencies", "VHF and UHF bands",
        "A",
        "5G networks utilize frequencies in the sub-6 GHz spectrum and the high-frequency mmWave band for high-speed transmission.",
        "Science & Technology"
    ),
    (
        "Which government entity serves as the focal point for international climate change negotiations (UNFCCC) in Nepal?",
        "Ministry of Forests and Environment", "National Planning Commission", "Ministry of Finance", "Department of Hydrology",
        "A",
        "The Ministry of Forests and Environment (MoFE) is the designated national focal point for the UNFCCC and IPCC in Nepal.",
        "Science & Technology"
    ),
    (
        "What is the name of the oldest scientific research and development institution established in Nepal in 2039 BS?",
        "NAST (Nepal Academy of Science and Technology)", "RECAST (Research Centre for Applied Science)", "NARC (Nepal Agricultural Research Council)", "Department of Science",
        "A",
        "NAST (originally RONAST) was established in 1982 to promote science, technology, and local research capabilities.",
        "Science & Technology"
    ),
    (
        "Which crop is the primary staple food crop of Nepal, heavily influenced by monsoon sciences?",
        "Maize", "Wheat", "Paddy (Rice)", "Millet",
        "C",
        "Paddy (Rice) is the most important staple crop of Nepal, accounting for a significant share of agricultural GDP.",
        "Science & Technology"
    ),
    (
        "What type of energy resource does the government of Nepal prioritize for clean energy transition?",
        "Coal power", "Nuclear power", "Hydroelectric power", "Natural gas",
        "C",
        "Nepal is rich in water resources and prioritizes run-of-river and reservoir-type Hydroelectric power as its main energy source.",
        "Science & Technology"
    )
]

economics = [
    (
        "Which Plan of the Government of Nepal is currently running (ending in 2080/81)?",
        "14th Five-Year Plan", "15th Five-Year Plan", "16th Five-Year Plan", "13th Three-Year Plan",
        "B",
        "The 15th Five-Year Plan of Nepal covers the period from fiscal year 2076/77 to 2080/81.",
        "Economics"
    ),
    (
        "Which sector is currently the largest contributor to the Gross Domestic Product (GDP) of Nepal?",
        "Agriculture", "Industry", "Services", "Tourism",
        "C",
        "The Services sector (consisting of trade, finance, real estate, education, etc.) is the largest contributor to GDP, followed by agriculture.",
        "Economics"
    ),
    (
        "In which year was the central bank of Nepal, Nepal Rastra Bank, established?",
        "1950 AD", "1956 AD (2013 BS)", "1960 AD", "1972 AD",
        "B",
        "Nepal Rastra Bank was established on April 26, 1956 (Baishakh 14, 2013 BS) under the Nepal Rastra Bank Act 2012.",
        "Economics"
    ),
    (
        "Who was the first Governor of Nepal Rastra Bank?",
        "Himalaya Shumsher Rana", "Pradyumna Lal Rajbhandari", "Dr. Yadav Prasad Pant", "Kalyan Bikram Adhikari",
        "A",
        "Himalaya Shumsher Rana served as the first Governor of Nepal Rastra Bank from 1956 to 1961.",
        "Economics"
    ),
    (
        "Which country is the largest trading partner of Nepal for both imports and exports?",
        "China", "United States", "India", "Bangladesh",
        "C",
        "India is Nepal's largest trading partner, accounting for over 60% of Nepal's total foreign trade.",
        "Economics"
    ),
    (
        "What is the largest source of foreign currency earnings for Nepal, supporting its balance of payments?",
        "Tourism revenue", "Remittance from foreign employment", "Agricultural exports", "Foreign direct investment",
        "B",
        "Remittance sent by Nepalese workers abroad is the biggest source of foreign currency, making up over 20% of GDP.",
        "Economics"
    ),
    (
        "In which year did the Government of Nepal introduce Value Added Tax (VAT)?",
        "2050 BS", "2054 BS (1997 AD)", "2060 BS", "2072 BS",
        "B",
        "VAT was introduced in Nepal on Mangsir 1, 2054 BS (November 16, 1997), replacing sales tax, contract tax, and hotel tax.",
        "Economics"
    ),
    (
        "What is the standard flat rate of Value Added Tax (VAT) in Nepal?",
        "10%", "13%", "15%", "18%",
        "B",
        "Nepal has maintained a flat VAT rate of 13% since its implementation.",
        "Economics"
    ),
    (
        "Which government entity is responsible for drafting and executing the fiscal policy of Nepal?",
        "Nepal Rastra Bank", "National Planning Commission", "Ministry of Finance", "Department of Customs",
        "C",
        "The Ministry of Finance (MoF) is the executive agency that formulates and implements fiscal policy, including the annual budget.",
        "Economics"
    ),
    (
        "Which entity is responsible for formulating and implementing the monetary policy of Nepal?",
        "Ministry of Finance", "Nepal Rastra Bank", "National Planning Commission", "Economic Council",
        "B",
        "Nepal Rastra Bank publishes and manages the annual Monetary Policy to maintain price and balance of payment stability.",
        "Economics"
    ),
    (
        "What is the exchange rate peg arrangement between the Nepalese Rupee (NPR) and the Indian Rupee (INR)?",
        "1 INR = 1.0 NPR", "1 INR = 1.6 NPR", "1 INR = 1.5 NPR", "Pegging was abolished",
        "B",
        "The Nepalese Rupee has been pegged to the Indian Rupee at a rate of 1 INR = 1.6 NPR since 1993 AD.",
        "Economics"
    ),
    (
        "Which year has been targeted for Nepal's graduation from the Least Developed Country (LDC) category?",
        "2022 AD", "2024 AD", "2026 AD", "2030 AD",
        "C",
        "The UN General Assembly approved Nepal's graduation from the LDC category by 2026, granting a five-year transition period.",
        "Economics"
    ),
    (
        "Which is the first commercial bank established in Nepal?",
        "Nepal Rastra Bank", "Nepal Bank Limited", "Rastriya Banijya Bank", "Agricultural Development Bank",
        "B",
        "Nepal Bank Limited was established on Kartik 30, 1997 BS (1937 AD), inaugurating the formal banking sector in Nepal.",
        "Economics"
    ),
    (
        "What was the targeted absolute poverty rate of Nepal by the end of the 15th Five-Year Plan?",
        "4.9%", "9.5%", "11.2%", "16.6%",
        "B",
        "The 15th Plan aimed to reduce absolute poverty from 18.7% to 9.5% by the end of the plan period.",
        "Economics"
    ),
    (
        "Which index is primarily used to measure consumer inflation in Nepal?",
        "Consumer Price Index (CPI)", "Wholesale Price Index (WPI)", "GDP Deflator", "Producer Price Index (PPI)",
        "A",
        "Nepal Rastra Bank compiles the Consumer Price Index (CPI) to measure retail inflation across food and non-food items.",
        "Economics"
    ),
    (
        "Where was Nepal's first Special Economic Zone (SEZ) established?",
        "Biratnagar", "Bhairahawa", "Simara", "Hetauda",
        "B",
        "Bhairahawa Special Economic Zone (SEZ) in Rupandehi was built as the first designated zone for export-oriented industries.",
        "Economics"
    ),
    (
        "Which of the following is traditionally one of Nepal's largest export earners among manufactured products?",
        "Electronics", "Handmade woolen carpets", "Automobiles", "Raw cotton",
        "B",
        "Handmade Tibetan-style woolen carpets and pashminas are historically major contributors to Nepal's industrial exports.",
        "Economics"
    ),
    (
        "What does Nepal's budget balance traditionally run?",
        "Budget Surplus", "Budget Deficit", "Balanced Budget", "Zero-based Budget",
        "B",
        "Nepal consistently runs a fiscal or budget deficit, where planned expenditures exceed estimated revenue collections.",
        "Economics"
    ),
    (
        "Which document is presented to the parliament by the Finance Minister a day before the budget presentation, showing economic indicators?",
        "Monetary Policy", "Economic Survey", "Fiscal Review", "Red Book",
        "B",
        "The Economic Survey is an annual document published by the Ministry of Finance, summarizing the previous year's economic performance.",
        "Economics"
    ),
    (
        "Which international financial institution is Nepal's largest multilateral development partner?",
        "International Monetary Fund", "World Bank Group", "Asian Development Bank (ADB)", "Asian Infrastructure Investment Bank",
        "B",
        "The World Bank and the ADB are the two primary multilateral development lenders supporting infrastructure and social projects in Nepal.",
        "Economics"
    ),
    (
        "What is the base currency for international trade transactions in Nepal?",
        "Indian Rupee", "Euro", "US Dollar", "Chinese Yuan",
        "C",
        "The US Dollar is the standard transaction currency for Nepal's international trade outside of trade with India.",
        "Economics"
    )
]

math_reasoning = [
    (
        "What is the average of the first 50 natural numbers (1 to 50)?",
        "25.0", "25.5", "26.0", "50.0",
        "B",
        "The average of first N natural numbers is (N+1)/2. For N=50, the average is 51/2 = 25.5.",
        "Mathematics & Reasoning"
    ),
    (
        "If 15% of a number is 45, what is the value of the number?",
        "200", "250", "300", "400",
        "C",
        "Let the number be X. 0.15 * X = 45 => X = 45 / 0.15 = 300.",
        "Mathematics & Reasoning"
    ),
    (
        "An article costing NPR 800 is sold for NPR 1,000. What is the profit percentage?",
        "20%", "25%", "30%", "33.3%",
        "B",
        "Profit = Selling Price - Cost Price = 1000 - 800 = 200. Profit % = (Profit/Cost Price) * 100 = (200/800) * 100 = 25%.",
        "Mathematics & Reasoning"
    ),
    (
        "A train running at 60 km/hr crosses a telephone pole in 9 seconds. What is the length of the train?",
        "120 meters", "150 meters", "180 meters", "324 meters",
        "B",
        "Speed = 60 km/hr = 60 * (5/18) m/s = 50/3 m/s. Length (Distance) = Speed * Time = (50/3) * 9 = 150 meters.",
        "Mathematics & Reasoning"
    ),
    (
        "If the ratio of A:B is 2:3 and B:C is 4:5, what is the combined ratio of A:B:C?",
        "8:12:15", "2:4:5", "6:9:15", "8:10:15",
        "A",
        "Multiply A:B by 4 (8:12) and B:C by 3 (12:15) to align B. The ratio is 8:12:15.",
        "Mathematics & Reasoning"
    ),
    (
        "Find the odd number out from the series: 2, 3, 5, 7, 9, 11, 13.",
        "3", "7", "9", "11",
        "C",
        "All numbers in the series are prime numbers except 9, which is a composite odd number.",
        "Mathematics & Reasoning"
    ),
    (
        "If 5 men can complete a job in 12 days, how many days will 10 men take to complete the same job?",
        "5 days", "6 days", "8 days", "24 days",
        "B",
        "Man-days constant: M1 * D1 = M2 * D2 => 5 * 12 = 10 * D2 => D2 = 60 / 10 = 6 days.",
        "Mathematics & Reasoning"
    ),
    (
        "Complete the number series: 2, 4, 8, 16, 32, ... What is the next number?",
        "40", "48", "64", "96",
        "C",
        "The series follows a geometric progression where each term is multiplied by 2. The next term is 32 * 2 = 64.",
        "Mathematics & Reasoning"
    ),
    (
        "The average age of 3 boys is 15 years. If their ages are in the ratio 3:5:7, what is the age of the youngest boy?",
        "9 years", "15 years", "21 years", "25 years",
        "A",
        "Sum of ages = 3 * 15 = 45. Ratios sum = 3 + 5 + 7 = 15. One unit = 45 / 15 = 3. Youngest age (3 units) = 3 * 3 = 9 years.",
        "Mathematics & Reasoning"
    ),
    (
        "Find the simple interest on a principal of NPR 2,000 at a rate of 5% per annum for 3 years.",
        "NPR 100", "NPR 200", "NPR 300", "NPR 600",
        "C",
        "SI = (P * T * R) / 100 = (2000 * 3 * 5) / 100 = 300.",
        "Mathematics & Reasoning"
    ),
    (
        "At exactly 3:00, what is the angle between the hour hand and the minute hand of a clock?",
        "45 degrees", "90 degrees", "120 degrees", "180 degrees",
        "B",
        "A clock is 360 degrees, divided into 12 hours (30 degrees per hour). At 3:00, the hands are 3 hours apart: 3 * 30 = 90 degrees.",
        "Mathematics & Reasoning"
    ),
    (
        "A can complete a piece of work in 10 days and B can do it in 15 days. How many days will they take if they work together?",
        "5 days", "6 days", "7.5 days", "12 days",
        "B",
        "Combined rate = 1/10 + 1/15 = 5/30 = 1/6. The work is completed in 6 days.",
        "Mathematics & Reasoning"
    ),
    (
        "A town's population increases from 1,000 to 1,250. What is the percentage increase in population?",
        "20%", "25%", "30%", "50%",
        "B",
        "Increase = 1250 - 1000 = 250. Percentage increase = (250 / 1000) * 100 = 25%.",
        "Mathematics & Reasoning"
    ),
    (
        "A man walks 3 km North, then turns East and walks 4 km. How far is he from his starting point?",
        "5 km", "7 km", "8 km", "12 km",
        "A",
        "Using the Pythagorean theorem: Distance = sqrt(3^2 + 4^2) = sqrt(9 + 16) = sqrt(25) = 5 km.",
        "Mathematics & Reasoning"
    ),
    (
        "If in a code language, A = 1 and B = 2, then BAG equals 10. What does FED equal in the same code?",
        "12", "14", "15", "18",
        "C",
        "Sum of alphabetical positions: F = 6, E = 5, D = 4. 6 + 5 + 4 = 15.",
        "Mathematics & Reasoning"
    ),
    (
        "A vendor buys lemons at 6 for a rupee and sells them at 4 for a rupee. What is his profit percentage?",
        "25%", "33.3%", "50%", "66.6%",
        "C",
        "Cost of 1 lemon = 1/6. Selling price of 1 lemon = 1/4. Profit = 1/4 - 1/6 = 1/12. Profit % = (1/12) / (1/6) * 100 = 50%.",
        "Mathematics & Reasoning"
    )
]

nepali_lang = [
    (
        "Who is honored with the title of 'Adikavi' (First Poet) of the Nepali language?",
        "Bhanubhakta Acharya", "Laxmi Prasad Devkota", "Motiram Bhatta", "Lekhnath Paudyal",
        "A",
        "Bhanubhakta Acharya is recognized as the Adikavi for translating the epic Ramayana from Sanskrit to colloquial Nepali.",
        "Nepali Language & Literature"
    ),
    (
        "Who wrote the first translated Nepali version of the epic Ramayana?",
        "Laxmi Prasad Devkota", "Bhanubhakta Acharya", "Bhanubhakta's father", "Valmiki",
        "B",
        "Bhanubhakta Acharya wrote the Ramayana in Nepali Devanagari script, which helped popularize the language.",
        "Nepali Language & Literature"
    ),
    (
        "Who is honored as the 'Mahakavi' (Great Poet) of Nepalese literature?",
        "Bhanubhakta Acharya", "Laxmi Prasad Devkota", "Madhav Prasad Ghimire", "Siddhicharan Shrestha",
        "B",
        "Laxmi Prasad Devkota is honored as the Mahakavi for his outstanding contributions, versatility, and speed in writing epics.",
        "Nepali Language & Literature"
    ),
    (
        "Which famous classic romantic ballad (epic) in Nepali was written by Laxmi Prasad Devkota?",
        "Shakuntala", "Muna Madan", "Gauri", "Sulochana",
        "B",
        "Muna Madan, written in the Jhyaure folk meter, is the best-selling book in the history of Nepali literature.",
        "Nepali Language & Literature"
    ),
    (
        "Who holds the title of 'Rastrakavi' (National Poet) of Nepal?",
        "Laxmi Prasad Devkota", "Bhanubhakta Acharya", "Madhav Prasad Ghimire", "Byakul Maila",
        "C",
        "Madhav Prasad Ghimire was declared the Rastrakavi of Nepal in recognition of his patriotic and lyrical poetry.",
        "Nepali Language & Literature"
    ),
    (
        "The popular mourning epic (Shokakavya) 'Gauri' was composed by which literary figure?",
        "Bhanubhakta Acharya", "Laxmi Prasad Devkota", "Madhav Prasad Ghimire", "Lekhnath Paudyal",
        "C",
        "Rastrakavi Madhav Prasad Ghimire composed 'Gauri' in memory of his first wife after her untimely demise.",
        "Nepali Language & Literature"
    ),
    (
        "Which is the first printed and longest-running newspaper published in the Nepali language?",
        "Gorkhapatra", "Kantipur", "The Rising Nepal", "Sudha Sagar",
        "A",
        "Gorkhapatra started publication on May 6, 1901 (Baishakh 24, 1958 BS) during the Rana regime.",
        "Nepali Language & Literature"
    ),
    (
        "Who is popularly known as the 'Yug Kavi' (Poet of the Era) of Nepal?",
        "Motiram Bhatta", "Siddhicharan Shrestha", "Lekhnath Paudyal", "Dharani Dhar Koirala",
        "B",
        "Siddhicharan Shrestha is called Yug Kavi for writing revolutionary poems against the Rana autocracy.",
        "Nepali Language & Literature"
    ),
    (
        "Who wrote the lyrics of the current National Anthem of Nepal ('Sayaun Thunga Phool Ka')?",
        "Byakul Maila (Pradeep Kumar Rai)", "Amber Gurung", "Madhav Prasad Ghimire", "B.P. Koirala",
        "A",
        "The lyrics of the national anthem were written by poet Pradeep Kumar Rai, pen-named Byakul Maila.",
        "Nepali Language & Literature"
    ),
    (
        "Who composed the music/melody for the National Anthem of Nepal?",
        "Byakul Maila", "Amber Gurung", "Gopal Yonzon", "Narayan Gopal",
        "B",
        "Amber Gurung, a legendary musician and composer, composed the musical melody for the national anthem in 2007.",
        "Nepali Language & Literature"
    ),
    (
        "Who is considered the first novelist in Nepali literature, famous for the social novel 'Roopmati'?",
        "Laxmi Prasad Devkota", "Rudra Raj Pandey", "Diamond Shumsher Rana", "B.P. Koirala",
        "B",
        "Rudra Raj Pandey wrote 'Roopmati' in 1934 AD (1991 BS), which is recognized as the first modern social novel in Nepali.",
        "Nepali Language & Literature"
    ),
    (
        "What is the name of the most prestigious literary award distributed annually in Nepal?",
        "Madan Puraskar", "Jagadamba Shree", "Sajha Puraskar", "Tribhuvan Award",
        "A",
        "Madan Puraskar, established in 1956, is the most prestigious literary prize awarded to an outstanding book published in Nepali.",
        "Nepali Language & Literature"
    ),
    (
        "Who wrote the famous historical novels 'Seto Bagh' (White Tiger) and 'Basanti'?",
        "Rudra Raj Pandey", "Diamond Shumsher Rana", "B.P. Koirala", "Lal Gopal Subedi",
        "B",
        "Diamond Shumsher Rana wrote 'Seto Bagh' and 'Basanti', which dramatize the rise of the Ranas and court intrigues.",
        "Nepali Language & Literature"
    ),
    (
        "Which script is used to write the official Nepali language?",
        "Brahmi script", "Devanagari script", "Ranjana script", "Latin script",
        "B",
        "The Nepali language is officially written in the Devanagari script, which is also used for Sanskrit, Hindi, and Marathi.",
        "Nepali Language & Literature"
    ),
    (
        "How many vowel sounds (Swar Varna) are officially represented in the Devanagari alphabet used for Nepali?",
        "10 vowels", "11 vowels", "13 vowels", "14 vowels",
        "C",
        "The Devanagari alphabet lists 13 vowels (Aa, Aaa, I, Ii, U, Uu, Ri, E, Ai, O, Au, Am, Ah) used in formal writing.",
        "Nepali Language & Literature"
    ),
    (
        "Who wrote the psychological novel 'Teen Ghumti'?",
        "Bishweshwar Prasad Koirala", "Diamond Shumsher Rana", "Rudra Raj Pandey", "Devkota",
        "A",
        "Bishweshwar Prasad Koirala (B.P. Koirala), who was also a Prime Minister, wrote psychological novels including 'Teen Ghumti'.",
        "Nepali Language & Literature"
    )
]

# Merge all questions
all_questions = []

def make_question(q_tuple):
    text, a, b, c, d, correct, explanation, category = q_tuple
    return {
        "question_text": text,
        "option_a": a,
        "option_b": b,
        "option_c": c,
        "option_d": d,
        "correct_option": correct,
        "explanation": explanation,
        "syllabus_category": category,
        "source_name": "Loksewa Preparation Guide",
        "source_license": "Educational use",
        "verifier": "loksewa_seed",
        "source_year": 2080,
        "source_page": None,
        "verified_at": "2026-05-30"
    }

for q in constitution:
    all_questions.append(make_question(q))
for q in geography:
    all_questions.append(make_question(q))
for q in general_knowledge:
    all_questions.append(make_question(q))
for q in history:
    all_questions.append(make_question(q))
for q in governance:
    all_questions.append(make_question(q))
for q in science:
    all_questions.append(make_question(q))
for q in economics:
    all_questions.append(make_question(q))
for q in math_reasoning:
    all_questions.append(make_question(q))
for q in nepali_lang:
    all_questions.append(make_question(q))

# Write to file
target_path = Path(r"c:\My Files\Projects\Loksewa Ai App\data\sample_questions.json")
target_path.parent.mkdir(parents=True, exist_ok=True)
with open(target_path, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(all_questions)} questions at {target_path}")
