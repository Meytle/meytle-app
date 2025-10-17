import { Link } from 'react-router-dom';
import { FaUsers, FaUserCheck, FaMapMarkerAlt, FaStar, FaCoffee, FaUtensils, FaFilm, FaFootballBall, FaPalette, FaMusic, FaPlane, FaShoppingBag, FaMountain, FaGamepad, FaUmbrellaBeach, FaGlassCheers } from 'react-icons/fa';
import SarahHeroImage from '../assets/images/sarah-hero.svg';
import { ROUTES } from '../constants';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { theme } from '../styles/theme';

const Home = () => {
  const features = [
    {
      icon: <FaUsers className="w-8 h-8 text-primary-600" />,
      title: 'Wide Selection',
      description: 'Choose from a diverse community of verified companions'
    },
    {
      icon: <FaUserCheck className="w-8 h-8 text-primary-600" />,
      title: 'Verified Users',
      description: 'All companions go through a thorough verification process'
    },
    {
      icon: <FaMapMarkerAlt className="w-8 h-8 text-primary-600" />,
      title: 'Local & Global',
      description: 'Find companions in your city or when traveling abroad'
    },
    {
      icon: <FaStar className="w-8 h-8 text-primary-600" />,
      title: 'Top Rated',
      description: 'Read reviews and ratings from other users'
    }
  ];

  const interests = [
    { name: 'Coffee', icon: FaCoffee, color: 'bg-amber-100 text-amber-800' },
    { name: 'Dinner', icon: FaUtensils, color: 'bg-red-100 text-red-800' },
    { name: 'Movies', icon: FaFilm, color: 'bg-purple-100 text-purple-800' },
    { name: 'Sports', icon: FaFootballBall, color: 'bg-green-100 text-green-800' },
    { name: 'Art', icon: FaPalette, color: 'bg-pink-100 text-pink-800' },
    { name: 'Music', icon: FaMusic, color: 'bg-blue-100 text-blue-800' },
    { name: 'Travel', icon: FaPlane, color: 'bg-sky-100 text-sky-800' },
    { name: 'Shopping', icon: FaShoppingBag, color: 'bg-orange-100 text-orange-800' },
    { name: 'Hiking', icon: FaMountain, color: 'bg-emerald-100 text-emerald-800' },
    { name: 'Gaming', icon: FaGamepad, color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Beach', icon: FaUmbrellaBeach, color: 'bg-cyan-100 text-cyan-800' },
    { name: 'Nightlife', icon: FaGlassCheers, color: 'bg-violet-100 text-violet-800' }
  ];

  const steps = [
    {
      number: '01',
      title: 'Create Your Profile',
      description: 'Sign up and create a detailed profile with your interests and preferences.'
    },
    {
      number: '02',
      title: 'Find a Companion',
      description: 'Browse through profiles and find someone who matches your needs.'
    },
    {
      number: '03',
      title: 'Connect & Meet',
      description: 'Send a request and start chatting. Meet up and enjoy your time together!'
    }
  ];

  return (
    <div className="bg-white">
      {/* ========================================
          HERO SECTION - Completely Rewritten
          ======================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-secondary-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                <span className="block text-neutral-900">Meet Amazing</span>
                <span className="block bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-clip-text text-transparent">
                  People, Go Everywhere
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-2xl">
                Connect with vibrant, verified companions for exciting adventures. 
                From coffee dates to concerts - colorful experiences and authentic 
                connections await!
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-6 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-5 h-5 text-primary-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                    />
                  </svg>
                  <span className="font-medium">Verified Profiles</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg 
                    className="w-5 h-5 text-primary-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
                    />
                  </svg>
                  <span className="font-medium">4.9/5 Rating</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg 
                    className="w-5 h-5 text-primary-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M18 7a4 4 0 11-8 0 4 4 0 018 0z" 
                    />
                  </svg>
                  <span className="font-medium">10K+ Members</span>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Primary Button - Find a Companion (Redirects to Sign In) */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = ROUTES.SIGN_IN}
                  className="group"
                  icon={
                    <svg 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 8l4 4m0 0l-4 4m4-4H3" 
                      />
                    </svg>
                  }
                >
                  Find a Companion
                </Button>

                {/* Secondary Button - Become a Companion */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = `${ROUTES.SIGN_UP}?role=companion`}
                >
                  Become a Companion
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-3xl blur-3xl opacity-20 -z-10 transform scale-105" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-neutral-900/5">
                  <img 
                    src={SarahHeroImage} 
                    alt="Happy companions enjoying activities together" 
                    className="w-full h-[500px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section id="services" className="py-16 bg-neutral-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
              Discover Your Next{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                Adventure
              </span>
            </h2>
            <p className="mt-4 text-xl text-neutral-600">
              Find companions who share your interests and passions
            </p>
          </div>
          
          {/* Interests Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 max-w-6xl mx-auto mb-12">
            {interests.map((interest, index) => {
              const Icon = interest.icon;
              return (
                <Card
                  key={index}
                  variant="default"
                  padding="sm"
                  hoverable
                  className="text-center cursor-pointer group"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl ${interest.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700 group-hover:text-primary-600 transition-colors">
                      {interest.name}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="default"
                padding="lg"
                hoverable
                className="text-center group"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300">
                    <div className="text-primary-600 group-hover:text-white transition-colors duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 scroll-mt-16 bg-gradient-to-r from-warning-100 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 mb-4">
              How It{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                Works
              </span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-3xl mx-auto mb-12">
              Jump into exciting experiences in just a few colorful steps. Our vibrant platform makes finding your perfect adventure companion effortless!
            </p>
          </div>

          {/* Steps Grid */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <Card
                    variant="default"
                    padding="lg"
                    hoverable
                    className="text-center group relative"
                  >
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge
                        variant="info"
                        size="lg"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                      >
                        {step.number}
                      </Badge>
                    </div>
                    
                    <div className="mt-6 mb-4">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-xl bg-primary-50 shadow-md group-hover:scale-110 transition-transform duration-300">
                        <div className="w-8 h-8 text-primary-500">
                          {index === 0 && (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          )}
                          {index === 1 && (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M18 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          )}
                          {index === 2 && (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">{step.title}</h3>
                    <p className="text-neutral-600 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </Card>
                  
                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-20">
            <div className="flex justify-center items-center space-x-16 lg:space-x-32">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">
                  100%
                </div>
                <p className="text-neutral-600 font-medium text-sm">Verified Profiles</p>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">
                  24/7
                </div>
                <p className="text-neutral-600 font-medium text-sm">Customer Support</p>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-primary-500 mb-2">
                  Safe
                </div>
                <p className="text-neutral-600 font-medium text-sm">Secure Payments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Companions Section */}
      <section id="browse" className="py-16 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold sm:text-4xl text-neutral-900">
              Meet Our Amazing{' '}
              <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Companions
              </span>
            </h2>
            <p className="mt-4 text-xl text-neutral-600">
              Connect with vibrant, verified companions who bring energy and joy to every experience.
            </p>
          </div>

          {/* Companion Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* Sample Companion Cards */}
            {[
              {
                name: "Sarah Chen",
                age: 28,
                location: "San Francisco, CA",
                rating: 4.9,
                reviewCount: 127,
                description: "Art lover and coffee enthusiast with a passion for exploring hidden gems in the city.",
                interests: ["Art", "Coffee", "Museums"],
                responseTime: "Usually responds in 15 minutes"
              },
              {
                name: "Marcus Rodriguez",
                age: 32,
                location: "Los Angeles, CA", 
                rating: 4.8,
                reviewCount: 89,
                description: "Food connoisseur and music enthusiast with extensive knowledge of LA's dining scene.",
                interests: ["Food", "Music", "Nightlife"],
                responseTime: "Usually responds in 30 minutes"
              },
              {
                name: "Emma Thompson",
                age: 26,
                location: "New York, NY",
                rating: 4.9,
                reviewCount: 156,
                description: "Fitness enthusiast and outdoor adventurer who loves hiking and exploring nature.",
                interests: ["Hiking", "Fitness", "Travel"],
                responseTime: "Usually responds in 20 minutes"
              }
            ].map((companion, index) => (
              <Card
                key={index}
                variant="default"
                padding="none"
                hoverable
                className="overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={SarahHeroImage}
                    alt={companion.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-sm">
                    <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded-full">
                      <FaStar className="w-3 h-3 text-warning-400 mr-1" />
                      {companion.rating} ({companion.reviewCount})
                    </div>
                    <div className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-secondary-500">
                      Available
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" size="sm">
                      Verified
                    </Badge>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-neutral-900">{companion.name}, {companion.age}</h3>
                  </div>
                  <p className="text-neutral-600 text-sm mb-3">📍 {companion.location}</p>
                  <p className="text-neutral-700 text-sm mb-4 leading-relaxed">
                    {companion.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {companion.interests.map((interest, idx) => (
                      <Badge key={idx} variant="neutral" size="sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center text-neutral-500 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {companion.responseTime}
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => window.location.href = ROUTES.BROWSE_COMPANIONS}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Browse All Button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.href = ROUTES.SIGN_IN}
            >
              Sign In to Browse All Companions
            </Button>
          </div>
        </div>
      </section>



    </div>
  );
};

export default Home;
