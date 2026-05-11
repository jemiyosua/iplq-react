import { Markup } from 'interweave';
import React from 'react';
import { Col, Modal, Row } from 'react-bootstrap';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Gap, Input, TextArea } from '../../atoms';
import './modal-detail-transaksi-ipl.css'

const statusBadge = (status) => {
    switch (status) {
        case "settlement":
            return <div style={{ color:'#84cc16', fontWeight:'bold', fontSize:15 }}>{status}</div>
        case "pending":
            return <div style={{ color:'orange', fontWeight:'bold', fontSize:15 }}>{status}</div>
        default:
            return null;
    }
};

const formatRupiah = (value) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(value);
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
  
    const tanggal = date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  
    const jam = date.toTimeString().split(" ")[0]; // HH:mm:ss
  
    return `${tanggal} ${jam}`;
  };

const ModalDetailTransaksiIPL = ({ showModal, listDetailTransaksiIPL, onClickClose, orderID, transaksiID, statusTransaksi}) => {
    return (
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            onHide={onClickClose}
            centered
        >
            <Modal.Body className='modal-body-scrollable'>

                <h5 style={{ color:'#0f2f0f', fontWeight:'bold' }}>Detail Transaksi IPL</h5>

                <hr/>

                <div className="table-responsive">
					<table className="table align-middle">
						<thead style={{ backgroundColor: '#0b3d0b', color: '#FFFFFF'}}>
                            <tr >
                                {/* <th>Order ID</th>
                                <th>Transaksi ID</th> */}
                                <th>Bulan Dibayar</th>
                                <th>Tagihan</th>
                                <th>Tanggal Bayar</th>
                                <th>Status</th>
                            </tr>
						</thead>
						<tbody>

                            {listDetailTransaksiIPL?.map((item, index) => (
                                <tr key={index} >
                                    {/* <td>{orderID ? orderID : '-'}</td>
                                    <td>{transaksiID ? transaksiID : '-'}</td> */}
                                    <td>{item.bulan_invoice_format}</td>
                                    <td>{formatRupiah(item.nominal)}</td>
                                    <td>{item.tanggal_bayar ? formatDate(item.tanggal_bayar) : '-'}</td>
                                    <td>{statusBadge(statusTransaksi)}</td>
                                </tr>

                            ))}
                        </tbody>
                    </table>
				</div>

                <hr />

            </Modal.Body>
            
            <div style={{ display:'flex', justifyContent:'flex-end', padding:15, alignItems:'center'}}>
                <div style={{ backgroundColor:'grey', borderTopLeftRadius:8, borderTopRightRadius:8, borderBottomLeftRadius:8, borderBottomRightRadius:8, padding:10, width:150 }}>
                    <div 
                        style={{ color:'#FFFFFF', textAlign:'center', fontWeight:'bold', cursor:'pointer' }} 
                        onClick={onClickClose}
                    >Close</div>
                </div>
            </div>
        </Modal>
    )
}

export default ModalDetailTransaksiIPL;