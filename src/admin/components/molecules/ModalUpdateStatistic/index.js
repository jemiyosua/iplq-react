import { Markup } from 'interweave';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap, Input, TextArea } from '../../atoms';

const ModalUpdateStatistic = ({ showModal, onChangeImage, fileInputRef, previewUrl, onClickClearImage, titleUpdate, setTitleUpdate, alertTitle, setAlertTitle, onClickCancel, onClickUpdate, imagePreview }) => {
    return (
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>

                <h3 style={{ color:'#004372', fontWeight:'bold' }}>UPDATE STATISTIC</h3>

                <hr/>

                <Row>
                    <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Title</div>
                        <div style={{ marginBottom:5 }}>
                            <Input
                                required
                                value={titleUpdate}
                                onChange={setTitleUpdate}
                                onFocus={setAlertTitle}
                            />
                        </div>
                        {alertTitle && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Title cannot null</div>}
                    </Col>
                </Row>

                <Gap height={10} />

                <Row>
                    <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Images</div>
                        <div>
                            <Input
                                type="file"
                                accept="image/*" // Accept only image files
                                onChange={onChangeImage}
                                ref={fileInputRef}
                            />
                            
                            <Gap height={10} />

                            <div>
                                <div style={{ color:'#004372', fontWeight:'bold' }}>IMAGE NOW</div>
                                <img src={imagePreview} style={{ maxWidth:300, maxHeight:300 }} />
                            </div>

                            {previewUrl && (
                            <div>
                                <hr/>
                                <div>
                                    <div style={{ color:'#004372', fontWeight:'bold' }}>UPDATE IMAGE</div>
                                    <img src={previewUrl} style={{ maxWidth:300, maxHeight:300 }} />
                                </div>
                                <Gap height={10} />
                                <div style={{ backgroundColor:'red', padding:10, borderRadius:10, cursor:'pointer' }} onClick={onClickClearImage}>
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

export default ModalUpdateStatistic