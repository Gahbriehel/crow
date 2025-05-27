"use client"
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useReactToPrint } from "react-to-print";
import JsBarcode from "jsbarcode";

// Simplified formatToCurrency function
const formatToCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

function generateSku(businessName: string): string {
  if (!businessName.trim()) {
    throw new Error("Business name cannot be empty");
  }
  const prefix = businessName.slice(0, 2).toUpperCase();
  const digitCount = Math.floor(Math.random() * 3) + 8; // 8-10 digits
  const randomDigits = Array.from({ length: digitCount }, () =>
    Math.floor(Math.random() * 10).toString()
  ).join("");
  return `${prefix}${randomDigits}`;
}

// Barcode component using JsBarcode
const Barcode = ({ value, width = 2, height = 50 }: { value: string; width?: number; height?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: width,
          height: height,
          displayValue: false,
          margin: 0,
          background: "transparent"
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height]);
  
  return <svg ref={svgRef} className="border"></svg>;
};

export default function SkuGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [sku, setSku] = useState("");
  const [error, setError] = useState("");
  const [codeType, setCodeType] = useState<'qr' | 'barcode' | 'both'>('qr');
  const [showPrice, setShowPrice] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const handleGenerateSku = () => {
    try {
      if (!businessName.trim() || !productName.trim()) {
        setError("Please fill business name and product name");
        return;
      }
      if (showPrice && (!sellingPrice || isNaN(Number(sellingPrice)) || Number(sellingPrice) <= 0)) {
        setError("Please enter a valid selling price");
        return;
      }
      const newSku = generateSku(businessName);
      setSku(newSku);
      setError("");
    } catch (err) {
      setError("Failed to generate SKU");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `SKU_${sku}`,
    pageStyle: `
      @page {
        margin: 10mm;
        size: auto;
      }
      @media print {
        body { margin: 0; }
        .print-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 10px !important;
          font-family: Arial, sans-serif !important;
        }
        .print-title {
          font-size: 12px !important;
          font-weight: bold !important;
          margin-bottom: 5px !important;
          text-align: center !important;
        }
        .print-price {
          font-size: 14px !important;
          font-weight: bold !important;
          margin-bottom: 10px !important;
          text-align: center !important;
        }
        .print-sku {
          font-size: 10px !important;
          margin-top: 5px !important;
          text-align: center !important;
          font-family: monospace !important;
        }
      }
    `,
    onAfterPrint: () => {
      console.log(`${codeType} printed successfully`);
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          SKU Generator
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              value={businessName}
              onChange={(e) => {
                setBusinessName(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter business name"
            />
          </div>

          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              id="productName"
              value={productName}
              onChange={(e) => {
                setProductName(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="showPrice"
              checked={showPrice}
              onChange={() => setShowPrice(!showPrice)}
              className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="showPrice" className="text-sm font-medium text-gray-700">
              Include price on label
            </label>
          </div>

          {showPrice && (
            <div>
              <label htmlFor="sellingPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price
              </label>
              <input
                type="number"
                id="sellingPrice"
                value={sellingPrice}
                onChange={(e) => {
                  setSellingPrice(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter selling price"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Code Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="qr"
                  checked={codeType === 'qr'}
                  onChange={() => setCodeType('qr')}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">QR Code (Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="barcode"
                  checked={codeType === 'barcode'}
                  onChange={() => setCodeType('barcode')}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Barcode (Code 128)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="both"
                  checked={codeType === 'both'}
                  onChange={() => setCodeType('both')}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Both QR Code and Barcode</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerateSku}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium"
          >
            Generate SKU
          </button>
        </div>

        {sku && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800">Generated SKU:</p>
              <p className="text-xl font-bold text-indigo-600 font-mono bg-white px-3 py-1 rounded border inline-block mt-2">
                {sku}
              </p>
            </div>

            {/* Print Preview */}
            <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-3 text-center">Print Preview</h3>
              <div
                ref={printRef}
                className="print-content flex flex-col items-center justify-center p-4 bg-white"
              >
                <div className="print-title text-xs font-bold text-center mb-1 max-w-48 break-words">
                  {productName.toUpperCase()}
                </div>
                {showPrice && sellingPrice && (
                  <div className="print-price text-sm font-bold text-center mb-3">
                    {formatToCurrency(Number(sellingPrice))}
                  </div>
                )}
                
                <div className="flex flex-col items-center space-y-3">
                  {(codeType === 'qr' || codeType === 'both') && (
                    <QRCodeSVG
                      value={sku}
                      size={120}
                      level="H"
                      includeMargin={true}
                      className="border"
                    />
                  )}
                  
                  {(codeType === 'barcode' || codeType === 'both') && (
                    <div className="flex flex-col items-center">
                      <Barcode value={sku} width={2} height={40} />
                      <div className="print-sku text-xs mt-1 font-mono">
                        {sku}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handlePrint}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-medium"
              >
                🖨️ Print Label
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(sku)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors font-medium"
              >
                📋 Copy SKU
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}