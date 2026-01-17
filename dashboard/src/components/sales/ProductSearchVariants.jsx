import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, ScanBarcode } from 'lucide-react';
import { variantsService } from '../../services/variantsService';
import VariantsList from '../variants/VariantsList';
import VariantsComparison from '../variants/VariantsComparison';

const ProductSearchVariants = ({ onSelectProduct, onCreateManual }) => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]); // Base products
    const [selectedBase, setSelectedBase] = useState(null); // Selected base product to show variants
    const [variants, setVariants] = useState([]); // Variants of selected base
    const [view, setView] = useState('search'); // 'search' | 'variants'
    const [comparisonIds, setComparisonIds] = useState([]);
    const [showComparison, setShowComparison] = useState(false);
    const [comparisonData, setComparisonData] = useState([]);

    const searchTimeout = useRef(null);

    // Search Logic
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setLoading(true);
            try {
                // Search for simple variants to show mixed results? 
                // Plan: Search Base Products primarily to group them
                const baseProducts = await variantsService.searchBaseProducts(query);
                setResults(baseProducts.data || []);
            } catch (error) {
                console.error('Error searching products:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(searchTimeout.current);
    }, [query]);

    // Handle Base selection
    const handleBaseSelect = async (baseProduct) => {
        setSelectedBase(baseProduct);
        setLoading(true);
        try {
            const variantsData = await variantsService.getVariantsByBaseId(baseProduct.id);
            setVariants(variantsData.data || []);
            setView('variants');
        } catch (error) {
            console.error('Error fetching variants:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle Back
    const handleBackToResults = () => {
        setView('search');
        setSelectedBase(null);
        setVariants([]);
    };

    // Handle Compare
    const handleAddToCompare = (variant) => {
        if (!comparisonIds.includes(variant.id)) {
            if (comparisonIds.length >= 3) {
                // Remove first
                setComparisonIds(prev => [...prev.slice(1), variant.id]);
            } else {
                setComparisonIds(prev => [...prev, variant.id]);
            }
        }
        setShowComparison(true);
    };

    useEffect(() => {
        if (showComparison && comparisonIds.length > 0) {
            const fetchComparison = async () => {
                const data = await variantsService.compareVariants(comparisonIds);
                setComparisonData(data.data || []);
            };
            fetchComparison();
        }
    }, [showComparison, comparisonIds]);

    return (
        <div className="w-full space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder={selectedBase ? `Buscando variantes de: ${selectedBase.nombre}...` : "Buscar producto por nombre o SKU..."}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (view === 'variants' && !e.target.value) {
                            handleBackToResults(); // Reset if cleared
                        }
                    }}
                    autoComplete="off"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>

            {/* Results Area */}
            {view === 'search' && (
                <div className="space-y-2">
                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                            {results.map(product => (
                                <div
                                    key={product.id}
                                    onClick={() => handleBaseSelect(product)}
                                    className="flex items-center p-3 bg-white hover:bg-indigo-50 border border-gray-200 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600 mr-3">
                                        <Package size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{product.nombre}</h4>
                                        <div className="text-xs text-gray-500 flex gap-2">
                                            <span>SKU Base: {product.sku_base || 'N/A'}</span>
                                            {product.categoria_nombre && (
                                                <span className="bg-gray-100 px-1.5 rounded">{product.categoria_nombre}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-indigo-600 font-medium px-2 py-1 bg-indigo-50 rounded">
                                        Ver Variantes →
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : query && !loading ? (
                        <div
                            onClick={() => onCreateManual(query)}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                        >
                            <p className="text-gray-600 font-medium">No se encontraron productos.</p>
                            <p className="text-indigo-600 text-sm mt-1">+ Crear "{query}" manualmente</p>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Variants View */}
            {view === 'variants' && selectedBase && (
                <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-sm">
                                {selectedBase.nombre}
                            </span>
                            <span className="text-sm font-normal text-gray-500">
                                ({variants.length} opciones)
                            </span>
                        </h3>
                        <button
                            onClick={handleBackToResults}
                            className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            ← Volver a resultados
                        </button>
                    </div>

                    <VariantsList
                        variants={variants}
                        loading={loading}
                        onSelect={(v) => {
                            onSelectProduct(v);
                            // Optional: Reset query or keep it? 
                            // setQuery(''); 
                            // setView('search');
                        }}
                        onCompare={handleAddToCompare}
                    />
                </div>
            )}

            {/* Comparison Modal */}
            {showComparison && (
                <VariantsComparison
                    variants={comparisonData}
                    onClose={() => setShowComparison(false)}
                    onSelect={(v) => {
                        onSelectProduct(v);
                        setShowComparison(false);
                    }}
                />
            )}
        </div>
    );
};

export default ProductSearchVariants;
