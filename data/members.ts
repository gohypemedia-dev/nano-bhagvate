export interface Member {
  name: string;
  image: string;
  role?: string;
  location?: string;
  description?: string;
}

export const membersData: Member[] = [
  {
    name: "Mr Satish Kumar",
    image: "/images/members/satish-kumar.png",
  },
  {
    name: "Mr Chandan Singh",
    image: "/images/members/chandan-singh.jpg",
  },
  {
    name: "Mrs Prabha Gupta",
    image: "/images/members/prabha-gupta.jpg",
  },
  {
    name: "Mr Sudhir Gupta",
    image: "/images/members/sudhir-gupta.jpg",
    location: "Solan",
  },
  {
    name: "Mr Ankit Gupta",
    image: "/images/members/ankit-gupta.jpg",
  },
  {
    name: "Mrs Rashmi Sharma",
    image: "/images/members/rashmi-sharma.png",
  },
  {
    name: "Birender Yadav",
    image: "/images/members/birender-yadav.png",
  },
  {
    name: "Manish Yadav",
    image: "/images/members/manish-yadav.png",
  },
  {
    name: "Dr. Pramod Kumar Mishra",
    image: "/images/members/pramod-kumar-mishra.png",
  },
  {
    name: "Sonal Goel",
    image: "/images/members/sonal-goel.jpg",
    role: "IAS Officer",
  },
  {
    name: "Mr Sanjeev Akeel",
    image: "/images/members/sanjeev-akeel.png",
  },
  {
    name: "Mr Mani Singh",
    image: "/images/members/mani-singh.png",
  },
];
