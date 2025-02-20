import { useDrag } from 'react-dnd';
import { motion } from "framer-motion";

export const ModelItem = (model) => {
    const [, drag] = useDrag(() => ({
        type: "MODEL",
        item: { model },
    }));

    return (
        <motion.div
            ref={drag}
            className="p-2 bg-white shadow-md rounded-md cursor-pointer"
            whileHover={{ scale: 1.1 }}
        >
            <img src={model.model.image} alt={model.model.name} className='w-20 h-20' />
            <p className="text-center">{model.model.name}</p>
        </motion.div>
    );
}