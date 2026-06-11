import express from 'express'
import { auditStore } from './analysis.js'

const router = express.Router()

router.get('/:auditId', (req, res) => {
  const { auditId } = req.params
  const audit = auditStore.get(auditId)
  
  if (!audit) {
    return res.status(404).json({ error: "Audit not found or expired" })
  }
  
  res.json(audit)
})

export default router
