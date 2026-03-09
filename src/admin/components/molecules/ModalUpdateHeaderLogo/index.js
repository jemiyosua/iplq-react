import { Markup } from 'interweave';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap, Input } from '../../atoms';

const ModalUpdateHeaderLogo = ({ showModal, onChangeDark, onChangeLight, fileInputRef, previewUrlDark, previewUrlLight, onClickClearDark, onClickClearLight, onClickCancel, onClickUpdate, imageDarkPreview, imageLightPreview }) => {
    return (
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>

                <h3 style={{ color:'#004372', fontWeight:'bold' }}>UPDATE LOGO</h3>

                <hr/>

                <Row>
                    <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Images</div>
                        <div>
                            <Input
                                type="file"
                                accept="image/*" // Accept only image files
                                onChange={onChangeDark}
                                ref={fileInputRef}
                            />
                            
                            <Gap height={10} />

                            <div>
                                <div style={{ color:'#004372', fontWeight:'bold' }}>LOGO DARK</div>
                                <img src={imageDarkPreview} style={{ maxWidth:300, maxHeight:300 }} />
                            </div>

                            {previewUrlDark && (
                            <div>
                                <hr/>
                                <div>
                                    <div style={{ color:'#004372', fontWeight:'bold' }}>UPDATE IMAGE</div>
                                    <img src={previewUrlDark} style={{ maxWidth:300, maxHeight:300 }} />
                                </div>
                                <Gap height={10} />
                                <div style={{ backgroundColor:'red', padding:10, borderRadius:10, cursor:'pointer' }} onClick={onClickClearDark}>
                                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                                        <div style={{ color:'#FFFFFF', fontWeight:'bold' }}>Clear Image</div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <hr/>

                <Row>
                    <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Images</div>
                        <div>
                            <Input
                                type="file"
                                accept="image/*" // Accept only image files
                                onChange={onChangeLight}
                                ref={fileInputRef}
                            />
                            
                            <Gap height={10} />

                            <div>
                                <div style={{ color:'#004372', fontWeight:'bold' }}>LOGO LIGHT</div>
                                <img src={imageLightPreview} style={{ maxWidth:300, maxHeight:300 }} />
                            </div>

                            {previewUrlLight && (
                            <div>
                                <hr/>
                                <div>
                                    <div style={{ color:'#004372', fontWeight:'bold' }}>UPDATE IMAGE</div>
                                    <img src={previewUrlLight} style={{ maxWidth:300, maxHeight:300 }} />
                                </div>
                                <Gap height={10} />
                                <div style={{ backgroundColor:'red', padding:10, borderRadius:10, cursor:'pointer' }} onClick={onClickClearLight}>
                                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                                        <div style={{ color:'#FFFFFF', fontWeight:'bold' }}>Clear Image</div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <hr />

            </Modal.Body>
            
            <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center' }}>
                <div style={{ color:'#B4C1C8', marginRight:20, fontSize:20, cursor:'pointer' }} onClick={onClickCancel}>Cancel</div>
                <div style={{ backgroundColor:'#004372', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                    <div 
                        style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                        onClick={onClickUpdate}
                    >SAVE</div>
                </div>
            </div>
        </Modal>
    )
}

export default ModalUpdateHeaderLogo