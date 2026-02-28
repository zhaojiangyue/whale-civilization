/* 🐋 Whale Civilization 3 — Whale Encyclopedia Data */

export const WHALE_FACTS = {
    blue_whale: {
        name: 'Blue Whale',
        scientific: 'Balaenoptera musculus',
        size: '24-30 meters',
        weight: '100-200 tonnes',
        diet: 'Krill (up to 3,600 kg/day)',
        lifespan: '80-90 years',
        facts: [
            'The largest animal ever to live on Earth',
            'Their heart is the size of a small car',
            'Their tongue can weigh as much as an elephant',
            'Blue whale calls can be heard over 1,600 km away',
            'A blue whale calf gains about 90 kg per day',
        ],
    },
    humpback: {
        name: 'Humpback Whale',
        scientific: 'Megaptera novaeangliae',
        size: '12-16 meters',
        weight: '25-30 tonnes',
        diet: 'Krill, small fish',
        lifespan: '45-50 years',
        facts: [
            'Famous for their complex songs that can last hours',
            'Males sing to attract mates — songs evolve each year',
            'They use bubble-net feeding to catch fish cooperatively',
            'Humpbacks migrate up to 25,000 km annually',
            'Their pectoral fins are the longest of any whale',
        ],
    },
    sperm_whale: {
        name: 'Sperm Whale',
        scientific: 'Physeter macrocephalus',
        size: '15-18 meters',
        weight: '35-45 tonnes',
        diet: 'Giant squid, deep-sea fish',
        lifespan: '60-70 years',
        facts: [
            'Can dive to depths of 2,250 meters',
            'Has the largest brain of any animal ever',
            'Uses echolocation clicks that can stun prey',
            'Named for the spermaceti organ in their massive head',
            'Moby Dick was based on real sperm whales',
        ],
    },
    orca: {
        name: 'Orca (Killer Whale)',
        scientific: 'Orcinus orca',
        size: '6-8 meters',
        weight: '3-6 tonnes',
        diet: 'Fish, seals, other whales',
        lifespan: '50-80 years',
        facts: [
            'Actually the largest member of the dolphin family',
            'Hunt in coordinated pods with sophisticated strategies',
            'Different pods have distinct dialects and cultures',
            'Orcas are apex predators with no natural enemies',
            'Grandmothers lead pods and share ecological knowledge',
        ],
    },
    beluga: {
        name: 'Beluga Whale',
        scientific: 'Delphinapterus leucas',
        size: '3-5.5 meters',
        weight: '1-1.5 tonnes',
        diet: 'Fish, squid, crustaceans',
        lifespan: '35-50 years',
        facts: [
            'Called "canaries of the sea" for their vocal abilities',
            'One of few whales that can turn their head',
            'Born dark grey, turning white as adults',
            'Their flexible melon allows facial expressions',
            'Belugas are highly social, living in pods of hundreds',
        ],
    },
    narwhal: {
        name: 'Narwhal',
        scientific: 'Monodon monoceros',
        size: '4-5.5 meters',
        weight: '0.8-1.6 tonnes',
        diet: 'Arctic fish, squid, shrimp',
        lifespan: '40-50 years',
        facts: [
            'The "unicorn of the sea" — their tusk is a spiral tooth',
            'Tusks can grow up to 3 meters long',
            'The tusk has millions of nerve endings for sensing',
            'They can dive to 1,500 meters under Arctic ice',
            'Narwhals spend their entire lives in Arctic waters',
        ],
    },
};

export function getRandomFact(factionId) {
    const species = WHALE_FACTS[factionId];
    if (!species) return null;
    return species.facts[Math.floor(Math.random() * species.facts.length)];
}
