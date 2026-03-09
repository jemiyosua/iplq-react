import { Button } from '../../atoms';
import React, {useState, useEffect} from 'react';
import { FaArrowCircleUp } from 'react-icons/fa';
import './ScrollTopArrow.css';


const ScrollTopArrow = () =>{

  const [showScroll, setShowScroll] = useState(false)

  useEffect(()=>{
    window.addEventListener('scroll', checkScrollTop)
    return function cleanup() {
      window.removeEventListener('scroll', checkScrollTop)
    }
  })

  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 400){
      setShowScroll(true)
    } else if (showScroll && window.pageYOffset <= 400){
      setShowScroll(false)
    }
  };

  const scrollTop = () =>{
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
        <>
         {/* <FaArrowCircleUp
        style={{position:'fixed',bottom:10,right:10}}
         className="scrollTop" 
        onClick={scrollTop} 
        style={{height: 40
          // , right:-600
          ,display: showScroll ? 'flex' : 'none'}}/> */}
          <div style={{position:'fixed',bottom:10,right:10,textAlign:'center'}}>
            {/* <button style={{width:50,borderRadius:100}}> */}
       
              <FaArrowCircleUp className="scrollTop"  style={{height:40,width:'100%',display: showScroll ? 'flex' : 'none'}}
               onClick={scrollTop} />
            {/* </button> */}
            <p style={{display: showScroll ? 'flex' : 'none'}} onClick={scrollTop} >Scroll to top</p>
          </div>
        </>
  );
}

export default ScrollTopArrow;