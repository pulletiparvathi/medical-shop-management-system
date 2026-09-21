import React, { useState, useRef } from 'react';
import { scanPrescription, searchPrescriptionMedicines } from '../services/prescriptionService';

const PrescriptionScannerPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Scanning State
  const [isScanning, setIsScanning] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [scanResponse, setScanResponse] = useState(null);

  // Editable Medicine Items List
  const [editableMedicines, setEditableMedicines] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Manual Medicine Add Form
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newStrength, setNewStrength] = useState('');

  // Availability Search State
  const [isSearchingAvailability, setIsSearchingAvailability] = useState(false);
  const [searchPincode, setSearchPincode] = useState('500072');
  const [multiShops, setMultiShops] = useState([]);
  const [medicineAvailabilityMap, setMedicineAvailabilityMap] = useState({});
  const [hasSearched, setHasSearched] = useState(false);

  const fileInputRef = useRef(null);

  const STAGES = [
    'Uploading prescription file...',
    'Reading document via OCR service...',
    'Extracting medicine names & dosages...',
    'Matching against registered medicines catalog...',
    'Checking real-time pharmacy inventory...'
  ];

  const handleFileSelect = (file) => {
    setErrorMessage('');
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit. Please upload a smaller file.`);
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|pdf)$/i)) {
      setErrorMessage('Invalid file format. Please upload a JPG, JPEG, PNG, or PDF prescription file.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null); // PDF placeholder
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResponse(null);
    setEditableMedicines([]);
    setErrorMessage('');
    setHasSearched(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    setErrorMessage('');
    setCurrentStageIndex(0);

    // Simulate realistic loading stages
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        clearInterval(stageInterval);
        return prev;
      });
    }, 600);

    try {
      const formData = new FormData();
      formData.append('prescription_file', selectedFile);

      const res = await scanPrescription(formData);
      clearInterval(stageInterval);
      setIsScanning(false);

      if (res && res.success) {
        setScanResponse(res);
        setEditableMedicines(res.medicines || []);
        // Auto trigger initial availability search
        performAvailabilitySearch(res.medicines || [], searchPincode);
      } else {
        setErrorMessage(res.message || 'We couldn\'t read this prescription clearly. Please upload a clearer image or enter medicines manually.');
      }
    } catch (err) {
      clearInterval(stageInterval);
      setIsScanning(false);
      setErrorMessage(err.response?.data?.message || 'Medicine availability service is temporarily unavailable. Please try again.');
    }
  };

  const performAvailabilitySearch = async (medicinesList, pincode) => {
    setIsSearchingAvailability(true);
    setHasSearched(true);
    const shopMap = {};
    const medMap = {};

    for (const item of medicinesList) {
      const queryName = item.normalized_name || item.extracted_name;
      if (!queryName) continue;

      try {
        const searchRes = await searchPrescriptionMedicines({
          medicine: queryName,
          pincode: pincode || ''
        });

        const results = searchRes.results || [];
        medMap[item.id] = results;

        results.forEach((resItem) => {
          const shop = resItem.shop;
          if (!shopMap[shop.shop_id]) {
            shopMap[shop.shop_id] = {
              shop_id: shop.shop_id,
              shop_name: shop.shop_name,
              phone: shop.phone,
              address: shop.address,
              pincode: shop.pincode,
              area: shop.area,
              city: shop.city,
              available_medicines: [],
              matched_count: 0
            };
          }
          shopMap[shop.shop_id].available_medicines.push({
            medicine_name: resItem.medicine_name,
            price: resItem.price,
            available_quantity: resItem.available_quantity,
            stock_status: resItem.stock_status
          });
          shopMap[shop.shop_id].matched_count += 1;
        });
      } catch (err) {
        console.error('Error searching medicine:', queryName, err);
      }
    }

    const aggregatedShops = Object.values(shopMap);
    aggregatedShops.sort((a, b) => b.matched_count - a.matched_count);

    setMultiShops(aggregatedShops);
    setMedicineAvailabilityMap(medMap);
    setIsSearchingAvailability(false);
  };

  // Medicine Item Edit Handlers
  const handleItemChange = (id, field, value) => {
    setEditableMedicines((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id) => {
    setEditableMedicines((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddMissingMedicine = (e) => {
    e.preventDefault();
    if (!newMedicineName.trim()) return;

    const newItem = {
      id: Date.now(),
      extracted_name: newMedicineName.trim(),
      normalized_name: newMedicineName.trim(),
      strength: newStrength.trim() || 'Custom',
      dosage_form: 'Tablet',
      confidence: 1.0,
      verification_status: 'VERIFIED',
      matched: true,
      available_shops_count: 0,
      available_shops: []
    };

    setEditableMedicines((prev) => [...prev, newItem]);
    setNewMedicineName('');
    setNewStrength('');
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-dark d-flex align-items-center justify-content-center gap-2">
          <span>🩺</span> AI Doctor Prescription Scanner
        </h2>
        <p className="text-muted">
          Upload a doctor's prescription to extract medicines and check instant availability in nearby medical shops.
        </p>
      </div>

      {/* Safety Medical Disclaimer Alert */}
      <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4 d-flex align-items-start gap-3 p-3">
        <i className="bi bi-shield-exclamation text-warning fs-3 flex-shrink-0 mt-1"></i>
        <div>
          <h6 className="fw-bold text-dark mb-1">Important Safety Notice</h6>
          <p className="mb-0 text-secondary small">
            This tool extracts information from the uploaded prescription. It does not provide medical advice or replace a doctor's prescription.
            Please verify the extracted medicines, dosage, and instructions with a qualified healthcare professional.
          </p>
        </div>
      </div>

      {/* Upload & Preview Card */}
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="card-body p-4">
              {!selectedFile ? (
                /* Drag and Drop Zone */
                <div
                  className={`border-2 border-dashed rounded-4 p-5 text-center cursor-pointer transition-all ${
                    isDragOver ? 'border-primary bg-primary-subtle' : 'border-secondary-subtle bg-light'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="d-none"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  />
                  <div className="display-4 text-primary mb-3">📄</div>
                  <h5 className="fw-bold text-dark mb-1">Upload Doctor Prescription</h5>
                  <p className="text-muted small mb-3">
                    Drag and drop your prescription image or click to browse (JPG, PNG, PDF up to 5 MB)
                  </p>
                  <button type="button" className="btn btn-outline-primary rounded-pill px-4">
                    <i className="bi bi-upload me-2"></i> Select File
                  </button>
                </div>
              ) : (
                /* File Preview & Actions */
                <div>
                  <h6 className="fw-bold text-dark mb-3">Prescription Preview</h6>
                  <div className="row align-items-center g-4">
                    <div className="col-md-5 text-center">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Prescription Preview"
                          className="img-fluid rounded-3 border shadow-sm"
                          style={{ maxHeight: 260, objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="bg-light p-4 rounded-3 border text-center">
                          <i className="bi bi-file-earmark-pdf text-danger display-3"></i>
                          <div className="mt-2 fw-medium text-dark">{selectedFile.name}</div>
                        </div>
                      )}
                    </div>
                    <div className="col-md-7">
                      <div className="p-3 bg-light rounded-3 border mb-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="bi bi-paperclip text-primary"></i>
                          <span className="fw-bold text-dark text-truncate">{selectedFile.name}</span>
                        </div>
                        <div className="text-muted small">
                          File Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-danger rounded-pill px-4"
                          onClick={handleRemoveFile}
                          disabled={isScanning}
                        >
                          <i className="bi bi-trash me-1"></i> Remove
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary-custom rounded-pill px-4 flex-grow-1"
                          onClick={startScan}
                          disabled={isScanning}
                        >
                          {isScanning ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Scanning...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-search me-2"></i> Scan Prescription
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="alert alert-danger border-0 rounded-3 mt-3 mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                  <div>{errorMessage}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Stages Overlay */}
      {isScanning && (
        <div className="row justify-content-center mb-4">
          <div className="col-lg-10">
            <div className="card border-primary border-0 shadow-sm rounded-4 bg-primary-subtle p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="fw-bold text-primary">
                  <i className="bi bi-cpu-fill me-2"></i> Analyzing Prescription...
                </span>
                <span className="badge bg-warning text-dark px-3 py-2 rounded-pill">Demo / Mock Scan</span>
              </div>
              <div className="progress mb-3" style={{ height: 10 }}>
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                  style={{ width: `${((currentStageIndex + 1) / STAGES.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-secondary small fw-medium">
                Stage {currentStageIndex + 1} of {STAGES.length}: {STAGES[currentStageIndex]}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review & Manual Verification Section */}
      {scanResponse && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4 pb-3 border-bottom">
                <div>
                  <h4 className="fw-bold text-dark mb-1">Review & Verify Extracted Medicines</h4>
                  <p className="text-muted small mb-0">
                    Verify extracted items. You can edit names, remove items, or add missing medicines before searching availability.
                  </p>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-info text-dark px-3 py-2 rounded-pill">
                    {editableMedicines.length} Medicines Extracted
                  </span>
                  {scanResponse.is_mock_scan && (
                    <span className="badge bg-secondary px-3 py-2 rounded-pill">Mock OCR Provider</span>
                  )}
                </div>
              </div>

              {/* Editable Medicines List */}
              <div className="table-responsive mb-4">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '35%' }}>Extracted Medicine</th>
                      <th style={{ width: '20%' }}>Strength / Dosage</th>
                      <th style={{ width: '20%' }}>Status / Confidence</th>
                      <th style={{ width: '25%' }} className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableMedicines.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {editingId === item.id ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.normalized_name}
                              onChange={(e) => handleItemChange(item.id, 'normalized_name', e.target.value)}
                            />
                          ) : (
                            <div>
                              <div className="fw-bold text-dark">{item.normalized_name || item.extracted_name}</div>
                              <small className="text-muted">Raw OCR: "{item.extracted_name}"</small>
                            </div>
                          )}
                        </td>
                        <td>
                          {editingId === item.id ? (
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.strength}
                              onChange={(e) => handleItemChange(item.id, 'strength', e.target.value)}
                            />
                          ) : (
                            <span className="badge bg-light text-dark border px-2 py-1">{item.strength || 'N/A'}</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            {item.verification_status === 'VERIFIED' ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill w-auto d-inline-block">
                                ✓ Verified Match
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border border-warning-subtle rounded-pill w-auto d-inline-block">
                                ⚠️ Verify Name
                              </span>
                            )}
                            <small className="text-muted" style={{ fontSize: 11 }}>
                              Confidence: {Math.round(item.confidence * 100)}%
                            </small>
                          </div>
                        </td>
                        <td className="text-end">
                          {editingId === item.id ? (
                            <button
                              className="btn btn-sm btn-success rounded-pill px-3 me-1"
                              onClick={() => setEditingId(null)}
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3 me-1"
                              onClick={() => setEditingId(item.id)}
                            >
                              Edit
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill px-2"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {editableMedicines.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No medicines in list. Add a missing medicine below manually.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Missing Medicine Form */}
              <div className="p-3 bg-light rounded-3 border mb-4">
                <h6 className="fw-bold text-dark mb-2">+ Add Missing Medicine Manually</h6>
                <form onSubmit={handleAddMissingMedicine} className="row g-2 align-items-center">
                  <div className="col-md-5">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={newMedicineName}
                      onChange={(e) => setNewMedicineName(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Strength (e.g. 500mg)"
                      value={newStrength}
                      onChange={(e) => setNewStrength(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <button type="submit" className="btn btn-sm btn-outline-primary rounded-pill w-100">
                      Add Medicine
                    </button>
                  </div>
                </form>
              </div>

              {/* Pincode Search Filter & Trigger */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 border-top">
                <div className="d-flex align-items-center gap-2">
                  <label className="fw-bold text-dark small mb-0">Search Pincode:</label>
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill"
                    style={{ width: 140 }}
                    value={searchPincode}
                    onChange={(e) => setSearchPincode(e.target.value)}
                    placeholder="e.g. 500072"
                  />
                </div>
                <button
                  className="btn btn-primary-custom rounded-pill px-4"
                  onClick={() => performAvailabilitySearch(editableMedicines, searchPincode)}
                  disabled={isSearchingAvailability || editableMedicines.length === 0}
                >
                  {isSearchingAvailability ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Checking Shop Availability...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-building-check me-2"></i> Search Pharmacy Availability
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pharmacy Availability Results */}
      {hasSearched && (
        <div className="row justify-content-center mb-5">
          <div className="col-lg-10">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h4 className="fw-bold text-dark mb-1">Pharmacy Availability Results</h4>
              <p className="text-muted small mb-4">
                Showing medical shops with available stock for prescribed medicines near pincode <strong>{searchPincode || 'All Areas'}</strong>.
              </p>

              {/* Multi-Medicine Shop Matches */}
              <h5 className="fw-bold text-primary mb-3">
                <i className="bi bi-shop-window me-2"></i> Medical Shops carrying Prescribed Items
              </h5>

              {multiShops.map((shop) => (
                <div key={shop.shop_id} className="card border shadow-sm rounded-3 mb-3 p-3 hover-lift">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
                    <div>
                      <h5 className="fw-bold text-dark mb-0">{shop.shop_name}</h5>
                      <span className="text-muted small me-2">📍 {shop.address}, {shop.area}, {shop.city} - {shop.pincode}</span>
                      <span className="text-muted small">📞 {shop.phone}</span>
                    </div>
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                      {shop.matched_count} / {editableMedicines.length} Medicines Available
                    </span>
                  </div>

                  <hr className="my-2" />

                  <div className="d-flex flex-wrap gap-2">
                    {shop.available_medicines.map((m, idx) => (
                      <span key={idx} className="badge bg-light text-dark border p-2 rounded-2">
                        ✓ {m.medicine_name} - ₹{m.price} ({m.available_quantity} units)
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {multiShops.length === 0 && !isSearchingAvailability && (
                <div className="text-center py-5 bg-light rounded-4 border">
                  <i className="bi bi-exclamation-circle text-muted display-4"></i>
                  <h6 className="fw-bold text-dark mt-3">No Shops Found with Available Medicines</h6>
                  <p className="text-muted small mb-0">
                    Try changing the pincode or verifying medicine names in the review section above.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionScannerPage;
