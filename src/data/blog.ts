export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  category: string;
  image?: string;
  hue: number;
  body: string[];
}

export const posts: Post[] = [
  {
    slug: "anatomy-of-a-smash",
    title: "The Anatomy of a Proper Smash Burger",
    excerpt:
      "Why we smash at 400°C, why the crust matters more than the centre, and what actually happens in those first 40 seconds.",
    date: "2026-09-18",
    readTime: "6 min read",
    author: "Zaid Rahman",
    authorRole: "Head of Flame",
    category: "Craft",
    image: "/media/items/blaze-signature-smash.jpg",
    hue: 18,
    body: [
      "A smash burger is not a thin burger. That distinction matters. A thin burger is a compromise; a smash burger is a technique. You take a loosely packed ball of 80/20 chuck, drop it onto steel sitting at 400°C, and press it flat for exactly eight seconds.",
      "What happens in those eight seconds is the entire point. The Maillard reaction — the browning that creates flavour — happens fastest where meat meets hot metal. By smashing, you multiply the surface area touching the steel, which multiplies the crust, which multiplies the flavour. A thick patty simply cannot do this without overcooking its centre.",
      "We use a hand press, not a spatula, because we want even pressure across the whole disc. Uneven pressure gives you a burger that's crisp in the middle and soft at the edges, which is exactly backwards from what you want.",
      "The second secret is the fat. 80/20 is non-negotiable. The 20% renders out during the smash and essentially fries the crust in its own beef fat. This is why lean mince makes a sad, dry smash — there's nothing to baste the crust with.",
      "Then the flip. One flip, at ninety seconds, onto a clean hot spot. Cheese goes on immediately so the residual heat does the melting. Two slices, overhanging the edges, so they drip down and caramelise against the steel — those lacy cheese crisps are the best bite in the entire burger.",
      "Finally, steam. The burger goes into the bun and straight under a cloche for twenty seconds. This melts the cheese fully and softens the crown of the bun. Serve it within ninety seconds or the whole thing is a different, worse sandwich.",
    ],
  },
  {
    slug: "karachi-late-night-map",
    title: "A Field Guide to Eating at 2 AM in Karachi",
    excerpt:
      "Burns Road to Boat Basin, the places still lit at two in the morning, and why the city eats best when it's technically tomorrow.",
    date: "2026-08-04",
    readTime: "8 min read",
    author: "Aiman Siddiqui",
    authorRole: "City Editor",
    category: "City",
    image: "/media/hero/hero-2.jpg",
    hue: 28,
    body: [
      "Karachi does not sleep so much as it takes a brief pause. By 2 AM the traffic on Shahrah-e-Faisal has thinned to a hum, the sea breeze has properly arrived, and the city's second shift of eating begins.",
      "Start at Burns Road, where the nihari places have been open since before dawn and the paratha wallahs work a rotation that would break a lesser mortal. It's heavy, it's glorious, and it is absolutely not what you want if you have to be anywhere before eleven.",
      "Then Boat Basin, which is the true centre of Karachi's late-night gravity. Dozens of restaurants, all lit, all busy, all serving until three or four. It's where the city goes after everything else has closed, and where the argument about which place is best has been ongoing, unresolved, for roughly thirty years.",
      "The thing people get wrong about late-night eating is that they treat it as a lesser version of daytime eating. It isn't. It's a different meal entirely. You're not looking for balance or restraint. You're looking for salt, fat, heat and something cold to chase it with.",
      "This is why our midnight menu exists. Between 12 and 4 we serve a burger, four wings, fries and a drink for Rs 1,250. It's not a discount — it's a recognition that a 2 AM order and a 2 PM order have completely different jobs.",
      "Finish with chai. Always chai. Somewhere between the last bite and the drive home, there is a doodh patti with your name on it, and the city will still be awake to serve it to you.",
    ],
  },
  {
    slug: "building-blaze-bun",
    title: "How We Built Blaze & Bun Without a Single Investor",
    excerpt:
      "Seven years, twelve branches, one grill and a stubborn refusal to serve a burger we wouldn't eat ourselves.",
    date: "2026-06-22",
    readTime: "10 min read",
    author: "Hamza Iqbal",
    authorRole: "Founder",
    category: "Story",
    image: "/media/story/about.jpg",
    hue: 14,
    body: [
      "In 2019 I had one charcoal grill, a folding table, and a spot outside a Clifton café that let me set up on Friday nights. The first night we sold forty-one burgers and ran out of buns at 11 PM. I went home with Rs 13,000 in cash and the absolute certainty that this was going to work.",
      "I was almost right. It took another eighteen months before it actually worked.",
      "The hard part was never the food. The hard part was consistency — making the fortieth burger of a Friday night taste identical to the first one. That meant building prep systems, writing them down, weighing every patty, and accepting that 'cooked until it looks right' is not a system.",
      "We opened our first real branch in DHA in 2021 with eighty-four seats and a rent payment that terrified me monthly. It broke even in month four. Every branch since has been funded from the profits of the ones before it. No investors, no debt, no shortcuts on the ingredients to make a quarter look better.",
      "That last part matters more than it sounds. When you take investor money, you inherit someone else's timeline. When you grow on profit, your timeline is the only one in the room, and you get to say no to things — a cheaper bun, a leaner mince, a frozen patty — that would have made the numbers nicer and the burger worse.",
      "Twelve branches later, we still grind our own chuck every morning, still marinate chicken for a full 24 hours, and still hand-dredge every tender. It's slower and it's more expensive and it's the entire reason any of this is worth doing.",
      "If you're building something right now: the boring, unglamorous, write-it-down-and-weigh-it work is the thing that actually compounds. The rest is just noise.",
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
