import React from 'react';
import { Spinner } from 'react-bootstrap';

const Button = ({ title, img, cat, discount }) => {
    return (
        <div style={{paddingBottom:100, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <CardDeck style={{alignItems:'center'}}>
                <Card style={{ border: 'none', width:350, height:300, textAlign:'center'}}>
                    <div style={{color:'#888888', fontSize:20, paddingTop:15, paddingBottom:15}}>01.</div>
                    <div style={{fontWeight:'bold', fontSize:23, paddingBottom:15}}>Sign Up</div>
                    <div>Join StarPoin now for free.</div>
                    <div>Simply enter your email,</div>
                    <div>create a password, and you're</div>
                    <div>ready to earn and redeem!</div>
                    <Gap height={15} />
                </Card>
                <Card style={{ border: 'none', width:350, height:300, textAlign:'center'}}>
                    <div style={{color:'#888888', fontSize:20, paddingTop:15, paddingBottom:15}}>02.</div>
                    <div style={{fontWeight:'bold', fontSize:23, paddingBottom:15}}>Search Favorite Merchant</div>
                    <div>We're providing variety of E-Vouchers /</div>
                    <div>Discount from different category like F&B,</div>
                    <div>Fashion, Beauty, Travel, Financial Product,</div>
                    <div>and many others. </div>
                    <Gap height={15} />
                </Card>
                <Card style={{ border: 'none', width:350, height:300, textAlign:'center', alignItems:'center'}}>
                    <div style={{color:'#888888', fontSize:20, paddingTop:15, paddingBottom:15}}>03.</div>
                    <div style={{fontWeight:'bold', fontSize:23, paddingBottom:15}}>Get Discount / E-Vouchers</div>
                    <div>Get your Discount / E-Vouchers instantly now.</div>
                    <Gap height={15} />
                </Card>
            </CardDeck>
        </div>
    )
}

export default Button;
