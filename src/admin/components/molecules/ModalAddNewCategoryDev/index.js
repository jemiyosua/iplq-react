import { Markup } from 'interweave';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap, Input } from '../../atoms';

const ModalAddNewCategoryDev = ({ showModal, categoryNameAddNew, setCategoryNameAddNew, alertCategoryName, setAlertCategoryName, onClickCancel, onClickAddNew }) => {
    return (
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>

                <h3 style={{ color:'#004372', fontWeight:'bold' }}>ADD NEW CATEGORY DEVELOPMENT</h3>

                <hr/>

                <Row>
                    <Col xs={12} md={12} lg={12} style={{ paddingRight:6 }} >
                        <div style={{ fontSize:16, fontWeight:'bold', marginBottom:10, color:'#004372' }}>Category Name</div>
                        <div style={{ marginBottom:5 }}>
                            <Input
                                required
                                value={categoryNameAddNew}
                                onChange={setCategoryNameAddNew}
                                onFocus={setAlertCategoryName}
                            />
                        </div>
                        {alertCategoryName && <div style={{ fontSize:12, color:'red', fontWeight:'bold' }}>Category Name cannot null</div>}
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

export default ModalAddNewCategoryDev
