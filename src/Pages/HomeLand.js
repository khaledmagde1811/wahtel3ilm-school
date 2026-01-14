import React from 'react'
import HeroSection from '../Commpoanants/HomeCommpanants/HeroSection'
import AboutCorse from '../Commpoanants/HomeCommpanants/AboutCorse'
import Benfites from '../Commpoanants/HomeCommpanants/Benfites'
import CallToAction from '../Commpoanants/HomeCommpanants/CallToAction'
import ContactSection from '../Commpoanants/HomeCommpanants/ContactSection'
import FAQSection from '../Commpoanants/HomeCommpanants/FAQSection'
import TazkiyahSection from '../Commpoanants/HomeCommpanants/TazkiyahSection'
// import MiniDashboardWidgets from '../Commpoanants/HomeCommpanants/MiniDashboardWidgets'
const HomeLand = () => {
  return (
    <div>
        <HeroSection/>
        <AboutCorse/>
        <TazkiyahSection/>
        <Benfites/>
        <CallToAction/>
        {/* <MiniDashboardWidgets/> */}
        <FAQSection/>
        <ContactSection/>

    </div>
  )
}

export default HomeLand