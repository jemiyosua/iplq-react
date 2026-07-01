import React from "react";
import "./UpdateTransaksiModal.css";

const UpdateTransaksiModal = ({
    showModal,

	orderId,
	jenisTransaksi,
	onChangeJenisTransaksi,
	tipeTransaksi,
	onChangeTipeTransaksi,
	nominal,
	onChangeNominal,
	tanggalBayar,
	onChangeTanggalBayar,
	deskripsi,
	onChangeDeskripsi,

    onClose,
    onUpdate,
    onDelete
}) => {

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">

                <div className="modal-header">
                    <h2>Update Keuangan</h2>
                    <button
                        className="btn-close"
                        onClick={onClose}
                    >
                    </button>
                </div>

				<div className="form-group">
					<label>Order ID</label>
					<input
						type="text"
						value={orderId}
						disabled
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="form-group">
					<label>Jenis Transaksi</label>
					<select
						value={jenisTransaksi}
						onChange={onChangeJenisTransaksi}
					>
						<option value="kredit">Kredit</option>
						<option value="debit">Debit</option>
					</select>
				</div>

				<div className="form-group">
					<label>Tipe Transaksi</label>
					<select
						value={tipeTransaksi}
						onChange={onChangeTipeTransaksi}
					>
						<option value="iuran">Iuran</option>
						<option value="ipl">IPL</option>
						<option value="lainnya">Lainnya</option>
					</select>
				</div>

				<div className="form-group">
					<label>Nominal</label>
					<input
						type="text"
						value={nominal}
						onChange={onChangeNominal}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="form-group">
					<label>Tanggal Bayar</label>
					<input
						type="date"
						value={tanggalBayar}
						onChange={onChangeTanggalBayar}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="form-group">
					<label>Deskripsi</label>
					<textarea
						rows={4}
						value={deskripsi}
						onChange={onChangeDeskripsi}
						style={{ color:'#111111' }}
					/>
				</div>

				<div className="footer-action">
					<button className="btn-primary" onClick={onUpdate}>Update</button>
				</div>
				

            </div>
        </div>
    );
};

export default UpdateTransaksiModal;