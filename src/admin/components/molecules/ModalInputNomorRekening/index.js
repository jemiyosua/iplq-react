import React from "react";
import "./ModalInputNomorRekening.css";

const ModalInputNomorRekening = ({
    showModal,

	nomorRekening,
	onChangeNomorRekening,
	namaRekening,
	onChangeNamaRekening,
	listBank,
	idBank,
	namaBank,
	onChangeNamaBank,

    onClose,
    onInsert,
    onDelete
}) => {

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <div className="modal-header">
                    <h2>Input Nomor Rekening</h2>
                    <button
                        className="btn-close"
                        onClick={onClose}
                    >
                    </button>
                </div>

				<div className="form-group">
					<label>Nomor Rekening</label>
					<input
						type="text"
						value={nomorRekening}
						onChange={onChangeNomorRekening}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="form-group">
					<label>Nama Bank</label>
					<select value={idBank} onChange={onChangeNamaBank}>
						<option value="">-- Pilih Bank --</option>
						{listBank.map((item,index) => {
							return <option value={item.id}>{item.nama_bank}</option>
						})}
					</select>
				</div>

				<div className="form-group">
					<label>Nama Rekening</label>
					<input
						type="text"
						value={namaRekening}
						onChange={onChangeNamaRekening}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="footer-action">
					<button className="btn-primary" onClick={onInsert}>Submit</button>
				</div>
				

            </div>
        </div>
    );
};

export default ModalInputNomorRekening;