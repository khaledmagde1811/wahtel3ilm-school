import React from 'react'
import HeroSection from '../Commpoanants/HomeCommpanants/HeroSection'
import AboutCorse from '../Commpoanants/HomeCommpanants/AboutCorse'
import Benfites from '../Commpoanants/HomeCommpanants/Benfites'
import CallToAction from '../Commpoanants/HomeCommpanants/CallToAction'
import ContactSection from '../Commpoanants/HomeCommpanants/ContactSection'
import FAQSection from '../Commpoanants/HomeCommpanants/FAQSection'
const HomeLand = () => {
  return (
    <div>
        <HeroSection/>
        <AboutCorse/>
        <Benfites/>
        <CallToAction/>
        <FAQSection/>
        <ContactSection/>

    </div>
  )
}

export default HomeLand