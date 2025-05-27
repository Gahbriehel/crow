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
const Barcode = ({ value, width = 2, height = 38 }: { value: string; width?: number; height?: number }) => {
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
  
  return <svg ref={svgRef} className="border barcode-svg"></svg>;
};

export default function SkuGenerator() {
  const [businessName, setBusinessName] = useState("");
  const [productName, setProductName] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [sku, setSku] = useState("");
  const [error, setError] = useState("");
  const [codeType, setCodeType] = useState<'qr' | 'barcode'>('barcode');
  const [showPrice, setShowPrice] = useState(false);
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
    } catch {
      setError("Failed to generate SKU");
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `SKU_${sku}`,
    pageStyle: `
      @page {
        size: 2in 1in;
        margin: 0;
      }
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
        }
        .print-content {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          width: 1.6in !important;
          height: 0.8in !important;
          margin: 0.1in auto !important; /* Center content */
          padding: 1mm !important;
          font-family: Arial, sans-serif !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        .print-content .print-title {
          font-size: 8px !important;
          font-weight: 900 !important; /* Bolder text */
          margin-bottom: 1px !important;
          text-align: center !important;
          max-width: 100% !important;
          line-height: 1.2 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .print-content .print-price {
          font-size: 8px !important;
          font-weight: 900 !important; /* Bolder text */
          margin-bottom: 1px !important;
          text-align: center !important;
        }
        .print-content .print-sku {
          font-size: 6px !important;
          font-weight: 700 !important; /* Bolder text */
          margin-top: 1px !important;
          text-align: center !important;
          font-family: monospace !important;
        }
        .print-content .qrcode-svg {
          width: 0.5in !important;
          height: 0.5in !important;
        }
        .print-content .barcode-svg {
          width: 1in !important;
          height: 0.4in !important;
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
                  value="barcode"
                  checked={codeType === 'barcode'}
                  onChange={() => setCodeType('barcode')}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Barcode (Code 128, Recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="qr"
                  checked={codeType === 'qr'}
                  onChange={() => setCodeType('qr')}
                  className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">QR Code</span>
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
                
                <div className="flex flex-col items-center space-y-1">
                  {codeType === 'qr' && (
                    <QRCodeSVG
                      value={sku}
                      size={48}
                      level="H"
                      includeMargin={true}
                      className="border qrcode-svg"
                    />
                  )}
                  {codeType === 'barcode' && (
                    <div className="flex flex-col items-center">
                      <Barcode value={sku} width={2} height={38} />
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