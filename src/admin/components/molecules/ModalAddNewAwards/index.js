import { Markup } from 'interweave';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap, Input } from '../../atoms';

const ModalAddNewRewards = ({ showModal, onChangeImage, fileInputRef, previewUrl, onClickClearImage, titleAddNew, setTitleAddNew, alertTitle, setAlertTitle, descriptionAddNew, setDescriptionAddNew, alertDescription, setAlertDescription, yearAddNew, setYearAddNew, alertYear, setAlertYear, onClickCancel, onClickAddNew }) => {
    return (
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>

                <h3 style={{ color:'#004372', fontWeight:'bold' }}>ADD NEW AWARDS</h3>

                <hr/>

                <Row>
                    <Col xs={3} md={4} lg={3} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Title</div>
                        <div style={{ marginBottom:5 }}>
                            <Input
                                required
                                value={titleAddNew}
                                onChange={setTitleAddNew}
                                onFocus={setAlertTitle}
                            />
                        </div>
                        {alertTitle && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Title cannot null</div>}
                    </Col>
                    <Col xs={3} md={4} lg={3} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Description</div>
                        <div style={{ marginBottom:5 }}>
                            <Input
                                required
                                value={descriptionAddNew}
                                onChange={setDescriptionAddNew}
                                onFocus={setAlertDescription}
                            />
                        </div>
                        {alertDescription && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Description cannot null</div>}
                    </Col>
                    <Col xs={3} md={4} lg={3} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Year</div>
                        <div style={{ marginBottom:5 }}>
                            <Input
                                required
                                value={yearAddNew}
                                onChange={setYearAddNew}
                                onFocus={setAlertYear}
                            />
                        </div>
                        {alertYear && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Year cannot null</div>}
                    </Col>
                </Row>

                <Gap height={10} />

                <Row>
                    <Col xs={3} md={4} lg={4} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Hero Image</div>
                        <div>
                            <Input
                                type="file"
                                accept="image/*" // Accept only image files
                                onChange={onChangeImage}
                                ref={fileInputRef}
                            />
                            <Gap height={10} />
                            {previewUrl && (
                            <>
                                <div>
                                    <img src={previewUrl} style={{ maxWidth: '300px', maxHeight: '300px' }} />
                                </div>
                                <Gap height={10} />
                                <div style={{ backgroundColor:'red', padding:10, borderRadius:10, cursor:'pointer' }} onClick={onClickClearImage}>
                                    <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
                                        <div style={{ color:'#FFFFFF', fontWeight:'bold' }}>Clear Image</div>
                                    </div>
                                </div>
                            </>
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
                        onClick={onClickAddNew}
                    >SAVE</div>
                </div>
            </div>
        </Modal>
    )
}

export default ModalAddNewRewards
