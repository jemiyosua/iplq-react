import React from "react";
import "./ModalInputPengajuan.css";

const ModalInputPengajuan = ({
    showModal,

	keperluan,
	onChangeKeperluan,
	jumlah,
	onChangeJumlah,
	listRekening,
	rekeningTujuan,
	onChangeRekeningTujuan,

    onClose,
    onInsert,
    onDelete
}) => {

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <div className="modal-header">
                    <h2>Input Pengajuan</h2>
                    <button
                        className="btn-close"
                        onClick={onClose}
                    >
                    </button>
                </div>

				<div className="form-group">
					<label>Keperluan</label>
					<select
						value={keperluan}
						onChange={onChangeKeperluan}
					>
						<option value="">-- Pilih Keperluan --</option>
						<option value="tarik dana ipl">Penarikan Dana IPL</option>
					</select>
				</div>

				<div className="form-group">
					<label>Jumlah</label>
					<input
						type="text"
						value={jumlah}
						onChange={onChangeJumlah}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="form-group">
					<label>Rekening Tujuan</label>
					<select
						value={rekeningTujuan}
						onChange={onChangeRekeningTujuan}
					>
						<option value="iuran">-- Pilih Nomor Rekening --</option>
						{listRekening.map((item,index) => {
							let nomorRekening = item.nomor_rekening
							let namaBank = item.nama_bank
							let namaRekening = item.nama_rekening
							return <option value={item.id}>{nomorRekening + "(" + namaBank + ")" + " - " + namaRekening}</option>
						})}
					</select>
				</div>

				<div className="footer-action">
					<button className="btn-primary" onClick={onInsert}>Submit</button>
				</div>
				

            </div>
        </div>
    );
};

export default ModalInputPengajuan;